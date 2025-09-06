/**
 * Comprehensive Pathfinding Test Suite for Campus Connect
 * Automated testing with browser and Node.js compatibility
 */

class PathfindingTester {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = [];
        this.errorLog = [];
        this.config = {
            maxTestTime: 100, // ms
            minPathLength: 1,
            maxRetries: 3
        };
    }

    /**
     * Initialize the testing framework
     */
    async initialize() {
        console.log('🚀 Initializing Pathfinding Test Suite...');
        
        // Wait for campus data
        await this.waitForCampusData();
        
        // Validate initial state
        this.validateInitialState();
        
        // Create test interface
        this.createTestInterface();
        
        console.log('✅ Pathfinding Tester ready');
    }

    /**
     * Wait for campus data to be available
     */
    async waitForCampusData() {
        const maxWaitTime = 10000; // 10 seconds
        const startTime = Date.now();
        
        while (!window.campusNodes || !window.campusGraph || !window.astarPath) {
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Campus data failed to load within timeout period');
            }
            await this.sleep(100);
        }
        
        console.log('📊 Campus data loaded successfully');
    }

    /**
     * Validate initial campus data state
     */
    validateInitialState() {
        const issues = [];
        
        if (!Array.isArray(window.campusNodes)) {
            issues.push('campusNodes is not an array');
        }
        
        if (typeof window.campusGraph !== 'object') {
            issues.push('campusGraph is not an object');
        }
        
        if (typeof window.astarPath !== 'function') {
            issues.push('astarPath is not a function');
        }
        
        if (issues.length > 0) {
            throw new Error('Initial state validation failed: ' + issues.join(', '));
        }
        
        console.log('✓ Initial state validation passed');
    }

    /**
     * Run comprehensive test suite
     */
    async runComprehensiveTests() {
        console.log('🧪 Starting comprehensive pathfinding tests...');
        
        this.clearResults();
        
        // Run all test categories
        await this.runBasicConnectivityTests();
        await this.runThirdFloorSpecificTests();
        await this.runPerformanceTests();
        await this.runStressTests();
        await this.runEdgeCaseTests();
        await this.runRegressionTests();
        
        // Generate final report
        this.generateTestReport();
        
        return this.getTestSummary();
    }

    /**
     * Basic connectivity tests
     */
    async runBasicConnectivityTests() {
        console.log('🔗 Running basic connectivity tests...');
        
        const tests = [
            {
                name: 'All Nodes Reachable From Hub',
                test: () => this.testAllNodesReachableFromHub()
            },
            {
                name: 'Bidirectional Connections',
                test: () => this.testBidirectionalConnections()
            },
            {
                name: 'No Isolated Nodes',
                test: () => this.testNoIsolatedNodes()
            },
            {
                name: 'Graph Consistency',
                test: () => this.testGraphConsistency()
            }
        ];
        
        await this.runTestCategory('Basic Connectivity', tests);
    }

    /**
     * Third floor specific tests
     */
    async runThirdFloorSpecificTests() {
        console.log('🏢 Running third floor specific tests...');
        
        const tests = [
            {
                name: 'Room 310 to Room 305',
                test: () => this.testSpecificPath('room_310', 'room_305')
            },
            {
                name: 'Room 314 to Main Hub 4',
                test: () => this.testSpecificPath('room_314', 'main_hub_4')
            },
            {
                name: 'All Third Floor Classrooms Connected',
                test: () => this.testThirdFloorClassroomsConnected()
            },
            {
                name: 'Cross-Floor Navigation Preparation',
                test: () => this.testCrossFloorPreparation()
            }
        ];
        
        await this.runTestCategory('Third Floor Specific', tests);
    }

    /**
     * Performance tests
     */
    async runPerformanceTests() {
        console.log('⚡ Running performance tests...');
        
        const tests = [
            {
                name: 'Pathfinding Speed (<100ms)',
                test: () => this.testPathfindingSpeed()
            },
            {
                name: 'Memory Usage Stability',
                test: () => this.testMemoryUsage()
            },
            {
                name: 'Concurrent Pathfinding',
                test: () => this.testConcurrentPathfinding()
            }
        ];
        
        await this.runTestCategory('Performance', tests);
    }

    /**
     * Stress tests
     */
    async runStressTests() {
        console.log('💪 Running stress tests...');
        
        const tests = [
            {
                name: 'Random Path Generation (100x)',
                test: () => this.testRandomPaths(100)
            },
            {
                name: 'Rapid Sequential Pathfinding',
                test: () => this.testRapidSequentialPathfinding()
            },
            {
                name: 'Large Graph Traversal',
                test: () => this.testLargeGraphTraversal()
            }
        ];
        
        await this.runTestCategory('Stress Tests', tests);
    }

    /**
     * Edge case tests
     */
    async runEdgeCaseTests() {
        console.log('🔧 Running edge case tests...');
        
        const tests = [
            {
                name: 'Same Node to Same Node',
                test: () => this.testSameNodePath()
            },
            {
                name: 'Nonexistent Node Handling',
                test: () => this.testNonexistentNodes()
            },
            {
                name: 'Empty Graph Handling',
                test: () => this.testEmptyGraphHandling()
            },
            {
                name: 'Malformed Input Handling',
                test: () => this.testMalformedInputs()
            }
        ];
        
        await this.runTestCategory('Edge Cases', tests);
    }

    /**
     * Regression tests for known issues
     */
    async runRegressionTests() {
        console.log('🔄 Running regression tests...');
        
        const tests = [
            {
                name: 'Previously Failing Paths',
                test: () => this.testPreviouslyFailingPaths()
            },
            {
                name: 'Fixed Connection Verification',
                test: () => this.testFixedConnections()
            }
        ];
        
        await this.runTestCategory('Regression Tests', tests);
    }

    /**
     * Test implementations
     */
    async testAllNodesReachableFromHub() {
        const hubs = this.getNodesByType('intersection');
        if (hubs.length === 0) return { success: true, note: 'No hubs found' };
        
        const mainHub = hubs[0];
        const allNodes = window.campusNodes;
        let reachableCount = 0;
        
        for (const node of allNodes) {
            if (node.id !== mainHub.id) {
                const path = this.findPath(mainHub.id, node.id);
                if (path && path.length > 0) {
                    reachableCount++;
                }
            }
        }
        
        const totalNodes = allNodes.length - 1; // Exclude hub itself
        const reachabilityPercentage = (reachableCount / totalNodes) * 100;
        
        return {
            success: reachabilityPercentage >= 95, // 95% should be reachable
            details: `${reachableCount}/${totalNodes} nodes reachable (${reachabilityPercentage.toFixed(1)}%)`
        };
    }

    async testBidirectionalConnections() {
        const graph = window.campusGraph;
        let violations = 0;
        const issues = [];
        
        for (const nodeId in graph) {
            for (const neighborId in graph[nodeId]) {
                if (!graph[neighborId] || !graph[neighborId][nodeId]) {
                    violations++;
                    issues.push(`${nodeId} -> ${neighborId} not bidirectional`);
                }
            }
        }
        
        return {
            success: violations === 0,
            details: violations === 0 ? 'All connections bidirectional' : `${violations} violations found`,
            issues: issues.slice(0, 5) // First 5 issues
        };
    }

    async testNoIsolatedNodes() {
        const graph = window.campusGraph;
        const isolated = [];
        
        for (const node of window.campusNodes) {
            if (!graph[node.id] || Object.keys(graph[node.id]).length === 0) {
                isolated.push(node.id);
            }
        }
        
        return {
            success: isolated.length === 0,
            details: isolated.length === 0 ? 'No isolated nodes' : `${isolated.length} isolated nodes`,
            isolated: isolated
        };
    }

    async testGraphConsistency() {
        const graph = window.campusGraph;
        const nodes = window.campusNodes;
        const issues = [];
        
        // Check if all graph nodes have node data
        for (const nodeId in graph) {
            const nodeData = nodes.find(n => n.id === nodeId);
            if (!nodeData) {
                issues.push(`Graph node ${nodeId} missing node data`);
            }
        }
        
        // Check for negative distances
        for (const nodeId in graph) {
            for (const neighborId in graph[nodeId]) {
                if (graph[nodeId][neighborId] < 0) {
                    issues.push(`Negative distance: ${nodeId} -> ${neighborId}`);
                }
            }
        }
        
        return {
            success: issues.length === 0,
            details: issues.length === 0 ? 'Graph consistent' : `${issues.length} issues found`,
            issues: issues.slice(0, 5)
        };
    }

    async testSpecificPath(start, end) {
        const startTime = performance.now();
        const path = this.findPath(start, end);
        const endTime = performance.now();
        
        return {
            success: path && path.length > 0,
            details: path ? `Path found: ${path.length} steps in ${(endTime - startTime).toFixed(2)}ms` : 'No path found',
            path: path,
            duration: endTime - startTime
        };
    }

    async testThirdFloorClassroomsConnected() {
        const thirdFloorRooms = window.campusNodes.filter(node => 
            node.type === 'class' && (
                node.id.includes('room_3') || 
                node.label.includes('3F') ||
                node.id.includes('class_3')
            )
        );
        
        if (thirdFloorRooms.length === 0) {
            return { success: true, note: 'No third floor rooms found' };
        }
        
        let connectedPairs = 0;
        let totalPairs = 0;
        
        for (let i = 0; i < thirdFloorRooms.length; i++) {
            for (let j = i + 1; j < thirdFloorRooms.length; j++) {
                totalPairs++;
                const path = this.findPath(thirdFloorRooms[i].id, thirdFloorRooms[j].id);
                if (path && path.length > 0) {
                    connectedPairs++;
                }
            }
        }
        
        const connectivity = totalPairs > 0 ? (connectedPairs / totalPairs) * 100 : 100;
        
        return {
            success: connectivity >= 95,
            details: `${connectedPairs}/${totalPairs} room pairs connected (${connectivity.toFixed(1)}%)`
        };
    }

    async testCrossFloorPreparation() {
        const stairways = this.getNodesByType('stairway');
        const classrooms = this.getNodesByType('class');
        
        if (stairways.length === 0) {
            return { success: true, note: 'No stairways found' };
        }
        
        let stairwayConnections = 0;
        
        for (const stairway of stairways) {
            for (const classroom of classrooms.slice(0, 3)) { // Test sample
                const path = this.findPath(stairway.id, classroom.id);
                if (path && path.length > 0) {
                    stairwayConnections++;
                }
            }
        }
        
        return {
            success: stairwayConnections > 0,
            details: `${stairwayConnections} stairway-to-classroom connections verified`
        };
    }

    async testPathfindingSpeed() {
        const nodes = this.getAllNodeIds();
        if (nodes.length < 2) return { success: false, details: 'Not enough nodes' };
        
        const testPairs = 10;
        const durations = [];
        
        for (let i = 0; i < testPairs; i++) {
            const start = nodes[i % nodes.length];
            const end = nodes[(i + 1) % nodes.length];
            
            const startTime = performance.now();
            const path = this.findPath(start, end);
            const endTime = performance.now();
            
            if (path && path.length > 0) {
                durations.push(endTime - startTime);
            }
        }
        
        const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b) / durations.length : 0;
        const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
        
        return {
            success: avgDuration < this.config.maxTestTime && maxDuration < this.config.maxTestTime * 2,
            details: `Avg: ${avgDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`,
            avgDuration,
            maxDuration
        };
    }

    async testMemoryUsage() {
        if (!performance.memory) {
            return { success: true, note: 'Memory API not available' };
        }
        
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Run multiple pathfinding operations
        for (let i = 0; i < 50; i++) {
            const nodes = this.getAllNodeIds();
            if (nodes.length >= 2) {
                this.findPath(nodes[0], nodes[1]);
            }
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;
        
        return {
            success: memoryIncrease < 1000000, // Less than 1MB increase
            details: `Memory increase: ${(memoryIncrease / 1024).toFixed(2)}KB`
        };
    }

    async testConcurrentPathfinding() {
        const nodes = this.getAllNodeIds();
        if (nodes.length < 4) return { success: false, details: 'Not enough nodes' };
        
        const promises = [];
        for (let i = 0; i < 5; i++) {
            const start = nodes[i % nodes.length];
            const end = nodes[(i + 2) % nodes.length];
            promises.push(this.findPathAsync(start, end));
        }
        
        const results = await Promise.all(promises);
        const successfulPaths = results.filter(path => path && path.length > 0);
        
        return {
            success: successfulPaths.length === results.length,
            details: `${successfulPaths.length}/${results.length} concurrent paths successful`
        };
    }

    async testRandomPaths(count = 100) {
        const nodes = this.getAllNodeIds();
        if (nodes.length < 2) return { success: false, details: 'Not enough nodes' };
        
        let successfulPaths = 0;
        const durations = [];
        
        for (let i = 0; i < count; i++) {
            const start = nodes[Math.floor(Math.random() * nodes.length)];
            let end = nodes[Math.floor(Math.random() * nodes.length)];
            
            // Ensure different start and end
            while (end === start && nodes.length > 1) {
                end = nodes[Math.floor(Math.random() * nodes.length)];
            }
            
            const startTime = performance.now();
            const path = this.findPath(start, end);
            const endTime = performance.now();
            
            if (path && path.length > 0) {
                successfulPaths++;
                durations.push(endTime - startTime);
            }
        }
        
        const successRate = (successfulPaths / count) * 100;
        const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b) / durations.length : 0;
        
        return {
            success: successRate >= 90, // 90% success rate required
            details: `${successfulPaths}/${count} paths successful (${successRate.toFixed(1)}%), avg ${avgDuration.toFixed(2)}ms`
        };
    }

    // Additional test implementations...

    /**
     * Helper functions
     */
    async runTestCategory(categoryName, tests) {
        console.log(`📋 Running ${categoryName} tests...`);
        
        for (const test of tests) {
            try {
                const startTime = performance.now();
                const result = await test.test();
                const endTime = performance.now();
                
                this.testResults.push({
                    category: categoryName,
                    name: test.name,
                    success: result.success,
                    details: result.details,
                    duration: endTime - startTime,
                    timestamp: new Date().toISOString(),
                    ...result
                });
                
                const status = result.success ? '✅' : '❌';
                console.log(`${status} ${test.name}: ${result.details || 'Completed'}`);
                
            } catch (error) {
                this.testResults.push({
                    category: categoryName,
                    name: test.name,
                    success: false,
                    error: error.message,
                    duration: 0,
                    timestamp: new Date().toISOString()
                });
                
                console.error(`💥 ${test.name}: ${error.message}`);
                this.errorLog.push({ test: test.name, error: error.message });
            }
        }
    }

    findPath(start, end) {
        if (window.astarPath && window.campusGraph && window.campusNodes) {
            return window.astarPath(window.campusGraph, window.campusNodes, start, end);
        }
        return null;
    }

    async findPathAsync(start, end) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.findPath(start, end));
            }, 0);
        });
    }

    getNodesByType(type) {
        return window.campusNodes ? window.campusNodes.filter(node => node.type === type) : [];
    }

    getAllNodeIds() {
        return window.campusNodes ? window.campusNodes.map(node => node.id) : [];
    }

    clearResults() {
        this.testResults = [];
        this.performanceMetrics = [];
        this.errorLog = [];
    }

    generateTestReport() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.success).length;
        const failed = total - passed;
        const successRate = total > 0 ? (passed / total) * 100 : 0;
        
        const report = {
            summary: {
                total,
                passed,
                failed,
                successRate: successRate.toFixed(1)
            },
            categories: this.groupResultsByCategory(),
            errors: this.errorLog,
            timestamp: new Date().toISOString()
        };
        
        console.log(`\n📊 Test Report Summary:`);
        console.log(`✅ Passed: ${passed}/${total} (${successRate.toFixed(1)}%)`);
        console.log(`❌ Failed: ${failed}`);
        
        if (this.errorLog.length > 0) {
            console.log(`💥 Errors: ${this.errorLog.length}`);
        }
        
        return report;
    }

    groupResultsByCategory() {
        const categories = {};
        
        for (const result of this.testResults) {
            if (!categories[result.category]) {
                categories[result.category] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                };
            }
            
            categories[result.category].total++;
            if (result.success) {
                categories[result.category].passed++;
            } else {
                categories[result.category].failed++;
            }
            categories[result.category].tests.push(result);
        }
        
        return categories;
    }

    getTestSummary() {
        return {
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.success).length,
            failedTests: this.testResults.filter(r => !r.success).length,
            errors: this.errorLog.length,
            successRate: this.testResults.length > 0 ? 
                (this.testResults.filter(r => r.success).length / this.testResults.length) * 100 : 0
        };
    }

    createTestInterface() {
        // Create test control panel
        const panel = document.createElement('div');
        panel.id = 'pathfinding-test-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            transform: translateY(-50%);
        `;
        
        panel.innerHTML = `
            <h3>🧪 Pathfinding Tester</h3>
            <button id="run-comprehensive-tests">Run All Tests</button>
            <button id="run-quick-tests">Quick Test</button>
            <button id="run-performance-only">Performance Only</button>
            <div id="test-status">Ready</div>
            <div id="test-progress"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('run-comprehensive-tests').addEventListener('click', () => {
            this.runComprehensiveTests();
        });
        
        document.getElementById('run-quick-tests').addEventListener('click', () => {
            this.runQuickTests();
        });
        
        document.getElementById('run-performance-only').addEventListener('click', () => {
            this.runPerformanceTests();
        });
    }

    async runQuickTests() {
        console.log('⚡ Running quick tests...');
        this.clearResults();
        
        await this.runTestCategory('Quick Tests', [
            { name: 'Basic Connectivity', test: () => this.testNoIsolatedNodes() },
            { name: 'Performance Check', test: () => this.testPathfindingSpeed() },
            { name: 'Room 310-305', test: () => this.testSpecificPath('room_310', 'room_305') }
        ]);
        
        this.generateTestReport();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(async () => {
            try {
                window.pathfindingTester = new PathfindingTester();
                await window.pathfindingTester.initialize();
            } catch (error) {
                console.error('❌ Failed to initialize Pathfinding Tester:', error);
            }
        }, 3000);
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathfindingTester;
}