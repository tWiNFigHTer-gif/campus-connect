/**
 * Browser Pathfinding Tests for Campus Connect
 * Comprehensive test suite for validating pathfinding functionality
 */

class BrowserPathfindingTests {
    constructor() {
        this.testSuites = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    /**
     * Initialize the test framework
     */
    async init() {
        console.log('🧪 Initializing Browser Pathfinding Tests...');
        
        // Wait for campus data to load
        await this.waitForCampusData();
        
        // Register all test suites
        this.registerTestSuites();
        
        // Create test UI
        this.createTestUI();
        
        console.log('✅ Test framework ready');
    }

    /**
     * Wait for campus data to be available
     */
    async waitForCampusData() {
        let attempts = 0;
        while (!window.campusNodes || !window.campusGraph) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            if (attempts > 50) {
                throw new Error('Campus data failed to load within 5 seconds');
            }
        }
        console.log('📊 Campus data loaded successfully');
    }

    /**
     * Register all test suites
     */
    registerTestSuites() {
        this.testSuites = [
            {
                name: 'Basic Navigation Tests',
                tests: this.getBasicNavigationTests()
            },
            {
                name: 'Third Floor Specific Tests',
                tests: this.getThirdFloorTests()
            },
            {
                name: 'Edge Case Tests',
                tests: this.getEdgeCaseTests()
            },
            {
                name: 'Performance Tests',
                tests: this.getPerformanceTests()
            },
            {
                name: 'Room Connection Tests',
                tests: this.getRoomConnectionTests()
            }
        ];
    }

    /**
     * Basic navigation test cases
     */
    getBasicNavigationTests() {
        return [
            {
                name: 'Class to Class Navigation',
                test: async () => {
                    const classNodes = this.getNodesByType('class');
                    if (classNodes.length < 2) return false;
                    
                    const path = this.findPath(classNodes[0].id, classNodes[1].id);
                    return path && path.length > 0;
                }
            },
            {
                name: 'Stairway to Class Navigation',
                test: async () => {
                    const stairwayNodes = this.getNodesByType('stairway');
                    const classNodes = this.getNodesByType('class');
                    
                    if (stairwayNodes.length === 0 || classNodes.length === 0) return false;
                    
                    const path = this.findPath(stairwayNodes[0].id, classNodes[0].id);
                    return path && path.length > 0;
                }
            },
            {
                name: 'Hub to Class Navigation',
                test: async () => {
                    const hubNodes = this.getNodesByType('intersection');
                    const classNodes = this.getNodesByType('class');
                    
                    if (hubNodes.length === 0 || classNodes.length === 0) return false;
                    
                    const path = this.findPath(hubNodes[0].id, classNodes[0].id);
                    return path && path.length > 0;
                }
            }
        ];
    }

    /**
     * Third floor specific test cases
     */
    getThirdFloorTests() {
        return [
            {
                name: 'Room 301 to Room 321 (Full Floor Traversal)',
                test: async () => {
                    const path = this.findPath('room_301', 'room_321');
                    return path && path.length > 0;
                }
            },
            {
                name: 'Room 314 to Main Hub 4 (Direct Connection)',
                test: async () => {
                    const path = this.findPath('room_314', 'main_hub_4');
                    return path && path.length > 0;
                }
            },
            {
                name: 'Room 310 to Room 305 (Previously Failing)',
                test: async () => {
                    const path = this.findPath('room_310', 'room_305');
                    return path && path.length > 0;
                }
            },
            {
                name: 'All Third Floor Classes Reachable',
                test: async () => {
                    const thirdFloorClasses = this.getThirdFloorClassrooms();
                    if (thirdFloorClasses.length === 0) return true; // No third floor data
                    
                    const startRoom = thirdFloorClasses[0];
                    let reachableCount = 0;
                    
                    for (const targetRoom of thirdFloorClasses) {
                        if (targetRoom !== startRoom) {
                            const path = this.findPath(startRoom, targetRoom);
                            if (path && path.length > 0) {
                                reachableCount++;
                            }
                        }
                    }
                    
                    return reachableCount === thirdFloorClasses.length - 1;
                }
            }
        ];
    }

    /**
     * Edge case test scenarios
     */
    getEdgeCaseTests() {
        return [
            {
                name: 'Same Node to Same Node',
                test: async () => {
                    const nodes = this.getAllNodeIds();
                    if (nodes.length === 0) return false;
                    
                    const path = this.findPath(nodes[0], nodes[0]);
                    return path && path.length >= 1; // Should return at least the starting node
                }
            },
            {
                name: 'Non-existent Node Handling',
                test: async () => {
                    try {
                        const path = this.findPath('nonexistent_node_1', 'nonexistent_node_2');
                        return !path || path.length === 0; // Should fail gracefully
                    } catch (error) {
                        return true; // Error handling is acceptable
                    }
                }
            },
            {
                name: 'Isolated Node Detection',
                test: async () => {
                    // Test if any nodes are completely isolated
                    const isolatedNodes = this.findIsolatedNodes();
                    return isolatedNodes.length === 0; // No isolated nodes should exist
                }
            }
        ];
    }

    /**
     * Performance test cases
     */
    getPerformanceTests() {
        return [
            {
                name: 'Pathfinding Speed Test (< 100ms)',
                test: async () => {
                    const nodes = this.getAllNodeIds();
                    if (nodes.length < 2) return false;
                    
                    const start = performance.now();
                    const path = this.findPath(nodes[0], nodes[nodes.length - 1]);
                    const end = performance.now();
                    
                    const duration = end - start;
                    console.log(`Pathfinding took ${duration.toFixed(2)}ms`);
                    
                    return duration < 100 && path && path.length > 0;
                }
            },
            {
                name: 'Multiple Concurrent Pathfinding',
                test: async () => {
                    const nodes = this.getAllNodeIds();
                    if (nodes.length < 4) return false;
                    
                    const promises = [];
                    for (let i = 0; i < 5; i++) {
                        const start = nodes[i % nodes.length];
                        const end = nodes[(i + 1) % nodes.length];
                        promises.push(this.findPathAsync(start, end));
                    }
                    
                    const results = await Promise.all(promises);
                    return results.every(path => path && path.length > 0);
                }
            }
        ];
    }

    /**
     * Room connection validation tests
     */
    getRoomConnectionTests() {
        return [
            {
                name: 'All Classrooms Connected to Graph',
                test: async () => {
                    const classrooms = this.getNodesByType('class');
                    
                    for (const classroom of classrooms) {
                        const connections = this.getNodeConnections(classroom.id);
                        if (connections.length === 0) {
                            console.warn(`Isolated classroom found: ${classroom.id}`);
                            return false;
                        }
                    }
                    
                    return true;
                }
            },
            {
                name: 'Bidirectional Connections Verified',
                test: async () => {
                    const graph = window.campusGraph;
                    
                    for (const nodeId in graph) {
                        for (const neighborId in graph[nodeId]) {
                            // Check if reverse connection exists
                            if (!graph[neighborId] || !graph[neighborId][nodeId]) {
                                console.warn(`Missing bidirectional connection: ${nodeId} <-> ${neighborId}`);
                                return false;
                            }
                        }
                    }
                    
                    return true;
                }
            }
        ];
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('🚀 Running all pathfinding tests...');
        
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };

        for (const suite of this.testSuites) {
            console.log(`📋 Running ${suite.name}...`);
            await this.runTestSuite(suite);
        }

        this.displayResults();
        return this.results;
    }

    /**
     * Run a specific test suite
     */
    async runTestSuite(suite) {
        for (const test of suite.tests) {
            this.results.total++;
            
            try {
                const startTime = performance.now();
                const passed = await test.test();
                const endTime = performance.now();
                
                if (passed) {
                    this.results.passed++;
                    console.log(`✅ ${test.name} (${(endTime - startTime).toFixed(2)}ms)`);
                } else {
                    this.results.failed++;
                    console.log(`❌ ${test.name}`);
                }
                
                this.results.details.push({
                    suite: suite.name,
                    test: test.name,
                    passed: passed,
                    duration: endTime - startTime
                });
                
            } catch (error) {
                this.results.failed++;
                console.error(`💥 ${test.name} - Error: ${error.message}`);
                
                this.results.details.push({
                    suite: suite.name,
                    test: test.name,
                    passed: false,
                    error: error.message
                });
            }
            
            // Update UI if available
            this.updateTestUI();
            
            // Small delay to prevent blocking
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Helper functions
     */
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
        if (!window.campusNodes) return [];
        return window.campusNodes.filter(node => node.type === type);
    }

    getAllNodeIds() {
        if (!window.campusNodes) return [];
        return window.campusNodes.map(node => node.id);
    }

    getThirdFloorClassrooms() {
        return this.getNodesByType('class')
            .filter(node => node.id.includes('room_3') || node.label.includes('3F'))
            .map(node => node.id);
    }

    getNodeConnections(nodeId) {
        if (!window.campusGraph || !window.campusGraph[nodeId]) return [];
        return Object.keys(window.campusGraph[nodeId]);
    }

    findIsolatedNodes() {
        const isolated = [];
        const allNodes = this.getAllNodeIds();
        
        for (const nodeId of allNodes) {
            const connections = this.getNodeConnections(nodeId);
            if (connections.length === 0) {
                isolated.push(nodeId);
            }
        }
        
        return isolated;
    }

    /**
     * Create test UI
     */
    createTestUI() {
        const testPanel = document.createElement('div');
        testPanel.id = 'pathfinding-test-panel';
        testPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 350px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        testPanel.innerHTML = `
            <h3>🧪 Pathfinding Tests</h3>
            <div id="test-status">Ready to run tests</div>
            <button id="run-tests-btn">Run All Tests</button>
            <button id="run-quick-tests-btn">Quick Test</button>
            <div id="test-progress"></div>
        `;
        
        document.body.appendChild(testPanel);
        
        // Bind events
        document.getElementById('run-tests-btn').addEventListener('click', () => {
            this.runAllTests();
        });
        
        document.getElementById('run-quick-tests-btn').addEventListener('click', () => {
            this.runQuickTests();
        });
    }

    /**
     * Update test UI
     */
    updateTestUI() {
        const statusElement = document.getElementById('test-status');
        const progressElement = document.getElementById('test-progress');
        
        if (statusElement) {
            const successRate = this.results.total > 0 
                ? (this.results.passed / this.results.total * 100).toFixed(1)
                : 0;
            
            statusElement.innerHTML = `
                Tests: ${this.results.total} | 
                Passed: ${this.results.passed} | 
                Failed: ${this.results.failed} |
                Success: ${successRate}%
            `;
        }
        
        if (progressElement && this.results.total > 0) {
            const progress = (this.results.passed + this.results.failed) / this.results.total * 100;
            progressElement.innerHTML = `Progress: ${progress.toFixed(1)}%`;
        }
    }

    /**
     * Run quick subset of tests
     */
    async runQuickTests() {
        console.log('⚡ Running quick pathfinding tests...');
        
        const quickSuite = {
            name: 'Quick Tests',
            tests: [
                this.getBasicNavigationTests()[0], // Just first basic test
                this.getThirdFloorTests()[2], // Room 310 to 305 test
                this.getPerformanceTests()[0] // Speed test
            ]
        };
        
        this.results = { passed: 0, failed: 0, total: 0, details: [] };
        await this.runTestSuite(quickSuite);
        this.displayResults();
    }

    /**
     * Display final results
     */
    displayResults() {
        const successRate = this.results.total > 0 
            ? (this.results.passed / this.results.total * 100).toFixed(1)
            : 0;
        
        console.log(`🎯 Test Results: ${this.results.passed}/${this.results.total} passed (${successRate}%)`);
        
        if (this.results.failed > 0) {
            console.log('❌ Failed tests:');
            this.results.details
                .filter(detail => !detail.passed)
                .forEach(detail => {
                    console.log(`  - ${detail.suite}: ${detail.test}`);
                });
        }
        
        this.updateTestUI();
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(async () => {
            try {
                window.pathfindingTests = new BrowserPathfindingTests();
                await window.pathfindingTests.init();
                console.log('✅ Pathfinding test framework loaded');
            } catch (error) {
                console.error('❌ Failed to initialize pathfinding tests:', error);
            }
        }, 3000); // Wait for campus system to fully load
    });
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserPathfindingTests;
}