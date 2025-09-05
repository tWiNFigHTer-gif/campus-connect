const fs = require('fs');
const path = require('path');

class PathfindingTester {
    constructor() {
        this.campusNodes = [];
        this.campusGraph = {};
        this.testResults = [];
    }

    async loadFloorData(floor = 'third') {
        try {
            const dataPath = floor === 'third' 
                ? './data/third_floor_nodes.json'
                : './pathfinding_graph_structural.json';
            
            console.log(`📂 Loading ${floor} floor data from: ${dataPath}`);
            
            if (!fs.existsSync(dataPath)) {
                throw new Error(`Data file not found: ${dataPath}`);
            }

            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            this.campusNodes = data.nodes || [];
            this.campusGraph = data.graph || data.edges || {};

            console.log(`✅ Loaded ${this.campusNodes.length} nodes and ${Object.keys(this.campusGraph).length} graph connections`);
            
            return {
                nodes: this.campusNodes.length,
                connections: Object.keys(this.campusGraph).length,
                searchableNodes: this.campusNodes.filter(n => n.searchable).length
            };
        } catch (error) {
            console.error(`❌ Error loading floor data: ${error.message}`);
            throw error;
        }
    }

    // A* Pathfinding Algorithm
    astarPath(start, end) {
        const endCoords = this.getNodeCoordinates(end);
        const startCoords = this.getNodeCoordinates(start);
        
        if (!endCoords || !startCoords) {
            return null;
        }

        if (!this.campusGraph[start] || !this.campusGraph[end]) {
            return null;
        }

        const gScore = {};
        const fScore = {};
        const previous = {};
        const openSet = new Set();
        const closedSet = new Set();

        // Initialize scores
        for (const node in this.campusGraph) {
            gScore[node] = Infinity;
            fScore[node] = Infinity;
            previous[node] = null;
        }

        gScore[start] = 0;
        fScore[start] = this.heuristicDistance(startCoords, endCoords);
        openSet.add(start);

        while (openSet.size > 0) {
            let current = null;
            let minFScore = Infinity;
            for (const node of openSet) {
                if (fScore[node] < minFScore) {
                    minFScore = fScore[node];
                    current = node;
                }
            }

            if (current === null) break;
            if (current === end) break;

            openSet.delete(current);
            closedSet.add(current);

            for (const neighbor in this.campusGraph[current] || {}) {
                if (closedSet.has(neighbor)) continue;
                
                const tentativeGScore = gScore[current] + this.campusGraph[current][neighbor];
                
                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                } else if (tentativeGScore >= gScore[neighbor]) {
                    continue;
                }

                previous[neighbor] = current;
                gScore[neighbor] = tentativeGScore;
                
                const neighborCoords = this.getNodeCoordinates(neighbor);
                if (neighborCoords) {
                    const hScore = this.heuristicDistance(neighborCoords, endCoords);
                    fScore[neighbor] = gScore[neighbor] + hScore;
                }
            }
        }

        // Reconstruct path
        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        return path.length > 1 && path[0] === start ? path : null;
    }

    getNodeCoordinates(nodeId) {
        const node = this.campusNodes.find(n => n.id === nodeId);
        return node ? { x: node.x, y: node.y } : null;
    }

    heuristicDistance(coord1, coord2) {
        const dx = coord2.x - coord1.x;
        const dy = coord2.y - coord1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    calculatePathDistance(path) {
        let distance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const current = this.getNodeCoordinates(path[i]);
            const next = this.getNodeCoordinates(path[i + 1]);
            if (current && next) {
                distance += this.heuristicDistance(current, next);
            }
        }
        return distance;
    }

    // Test Functions
    testConnectivity() {
        console.log('\n🔗 Testing node connectivity...');
        
        const results = {
            totalNodes: this.campusNodes.length,
            connectedNodes: 0,
            isolatedNodes: [],
            totalConnections: 0,
            bidirectionalIssues: []
        };

        // Check each node has at least one connection
        this.campusNodes.forEach(node => {
            if (!this.campusGraph[node.id] || Object.keys(this.campusGraph[node.id]).length === 0) {
                results.isolatedNodes.push(node.id);
            } else {
                results.connectedNodes++;
                results.totalConnections += Object.keys(this.campusGraph[node.id]).length;
            }
        });

        // Check bidirectional connections
        Object.keys(this.campusGraph).forEach(nodeId => {
            Object.keys(this.campusGraph[nodeId]).forEach(neighborId => {
                if (!this.campusGraph[neighborId] || !this.campusGraph[neighborId][nodeId]) {
                    results.bidirectionalIssues.push(`${nodeId} → ${neighborId}`);
                }
            });
        });

        console.log(`✅ Connected nodes: ${results.connectedNodes}/${results.totalNodes}`);
        if (results.isolatedNodes.length > 0) {
            console.log(`❌ Isolated nodes: ${results.isolatedNodes.join(', ')}`);
        }
        if (results.bidirectionalIssues.length > 0) {
            console.log(`⚠️ Unidirectional connections: ${results.bidirectionalIssues.length}`);
        }
        console.log(`📊 Total connections: ${results.totalConnections / 2} (bidirectional pairs)`);

        return results;
    }

    testPathfinding() {
        console.log('\n🛤️ Testing pathfinding algorithm...');
        
        const stairwayNodes = this.campusNodes.filter(n => n.type === 'stairway');
        const classNodes = this.campusNodes.filter(n => n.type === 'class');
        const intersectionNodes = this.campusNodes.filter(n => n.type === 'intersection');
        
        const results = {
            totalTests: 0,
            successfulPaths: 0,
            failedPaths: [],
            averagePathLength: 0,
            averageDistance: 0,
            testTypes: {}
        };

        const testCases = [
            {
                name: 'stairway-to-stairway',
                pairs: this.generateNodePairs(stairwayNodes, stairwayNodes),
                description: '🔼 Stairway to Stairway'
            },
            {
                name: 'class-to-class',
                pairs: this.generateNodePairs(classNodes, classNodes).slice(0, 20), // Limit for performance
                description: '🏫 Class to Class'
            },
            {
                name: 'stairway-to-class',
                pairs: this.generateNodePairs(stairwayNodes, classNodes.slice(0, 5)),
                description: '🔄 Stairway to Class'
            },
            {
                name: 'intersection-connectivity',
                pairs: this.generateNodePairs(intersectionNodes, intersectionNodes),
                description: '🚦 Intersection Connectivity'
            }
        ];

        let totalDistance = 0;
        let totalPathLength = 0;

        testCases.forEach(testCase => {
            console.log(`\n${testCase.description}:`);
            const testResults = {
                tested: 0,
                successful: 0,
                failed: 0
            };

            testCase.pairs.forEach(pair => {
                if (pair.start !== pair.end) {
                    testResults.tested++;
                    results.totalTests++;

                    const path = this.astarPath(pair.start, pair.end);
                    if (path && path.length > 1) {
                        testResults.successful++;
                        results.successfulPaths++;
                        totalDistance += this.calculatePathDistance(path);
                        totalPathLength += path.length;
                    } else {
                        testResults.failed++;
                        results.failedPaths.push(`${pair.start} → ${pair.end}`);
                    }
                }
            });

            const successRate = testResults.tested > 0 
                ? ((testResults.successful / testResults.tested) * 100).toFixed(1)
                : 0;

            console.log(`  Success: ${testResults.successful}/${testResults.tested} (${successRate}%)`);
            
            results.testTypes[testCase.name] = {
                tested: testResults.tested,
                successful: testResults.successful,
                successRate: successRate
            };
        });

        results.averageDistance = results.successfulPaths > 0 
            ? (totalDistance / results.successfulPaths).toFixed(1)
            : 0;
        results.averagePathLength = results.successfulPaths > 0
            ? (totalPathLength / results.successfulPaths).toFixed(1)
            : 0;

        const overallSuccessRate = results.totalTests > 0 
            ? ((results.successfulPaths / results.totalTests) * 100).toFixed(1)
            : 0;

        console.log(`\n📊 Overall Results:`);
        console.log(`  Success Rate: ${overallSuccessRate}% (${results.successfulPaths}/${results.totalTests})`);
        console.log(`  Average Path Length: ${results.averagePathLength} nodes`);
        console.log(`  Average Distance: ${results.averageDistance} units`);

        if (results.failedPaths.length > 0 && results.failedPaths.length <= 10) {
            console.log(`\n❌ Failed paths: ${results.failedPaths.join(', ')}`);
        } else if (results.failedPaths.length > 10) {
            console.log(`\n❌ ${results.failedPaths.length} failed paths (showing first 10):`);
            console.log(`   ${results.failedPaths.slice(0, 10).join(', ')}`);
        }

        return results;
    }

    generateNodePairs(startNodes, endNodes) {
        const pairs = [];
        startNodes.forEach(start => {
            endNodes.forEach(end => {
                if (start.id !== end.id) {
                    pairs.push({ start: start.id, end: end.id });
                }
            });
        });
        return pairs;
    }

    testPerformance() {
        console.log('\n⚡ Performance testing...');
        
        const testCases = [
            { iterations: 100, description: 'Random paths' },
            { iterations: 50, description: 'Cross-type paths' }
        ];

        testCases.forEach(testCase => {
            const startTime = Date.now();
            let successfulRuns = 0;

            for (let i = 0; i < testCase.iterations; i++) {
                const randomStart = this.campusNodes[Math.floor(Math.random() * this.campusNodes.length)];
                const randomEnd = this.campusNodes[Math.floor(Math.random() * this.campusNodes.length)];
                
                if (randomStart.id !== randomEnd.id) {
                    const path = this.astarPath(randomStart.id, randomEnd.id);
                    if (path && path.length > 1) {
                        successfulRuns++;
                    }
                }
            }

            const endTime = Date.now();
            const avgTime = (endTime - startTime) / testCase.iterations;
            const successRate = (successfulRuns / testCase.iterations * 100).toFixed(1);
            
            console.log(`  ${testCase.description}: ${avgTime.toFixed(2)}ms avg, ${successRate}% success`);
        });
    }

    async runFullTestSuite() {
        console.log('🧪 Campus Connect - Pathfinding Test Suite\n');
        console.log('=' .repeat(50));

        try {
            // Test both floors
            const floors = ['third', 'second'];
            
            for (const floor of floors) {
                console.log(`\n🏢 Testing ${floor.toUpperCase()} FLOOR:`);
                console.log('-'.repeat(30));

                const loadResults = await this.loadFloorData(floor);
                console.log(`📊 Loaded: ${loadResults.nodes} nodes, ${loadResults.searchableNodes} searchable, ${loadResults.connections} connections`);

                const connectivityResults = this.testConnectivity();
                const pathfindingResults = this.testPathfinding();
                this.testPerformance();

                // Summary for this floor
                const overallSuccessRate = pathfindingResults.totalTests > 0 
                    ? ((pathfindingResults.successfulPaths / pathfindingResults.totalTests) * 100).toFixed(1)
                    : 0;

                console.log(`\n📋 ${floor.toUpperCase()} FLOOR SUMMARY:`);
                console.log(`  Connectivity: ${connectivityResults.isolatedNodes.length === 0 ? '✅ PASS' : '❌ ISSUES'}`);
                console.log(`  Pathfinding: ${overallSuccessRate > 90 ? '✅ EXCELLENT' : overallSuccessRate > 75 ? '⚠️ GOOD' : '❌ NEEDS WORK'} (${overallSuccessRate}%)`);
                
                if (connectivityResults.isolatedNodes.length > 0) {
                    console.log(`  ⚠️ ${connectivityResults.isolatedNodes.length} isolated nodes need attention`);
                }
                if (pathfindingResults.failedPaths.length > 0) {
                    console.log(`  ⚠️ ${pathfindingResults.failedPaths.length} path failures detected`);
                }
            }

            console.log('\n' + '='.repeat(50));
            console.log('🎉 Test suite completed successfully!');
            
        } catch (error) {
            console.error(`❌ Test suite failed: ${error.message}`);
            throw error;
        }
    }
}

// Run the test suite if this file is executed directly
if (require.main === module) {
    const tester = new PathfindingTester();
    tester.runFullTestSuite()
        .then(() => {
            console.log('\n✅ All tests completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test suite failed:', error.message);
            process.exit(1);
        });
}

module.exports = PathfindingTester;
