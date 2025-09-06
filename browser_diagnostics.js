/**
 * Browser Diagnostics Tool for Campus Connect
 * Real-time pathfinding debugging and visualization
 */

class CampusConnectDiagnostics {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        this.pathfindingStats = {
            totalTests: 0,
            successfulTests: 0,
            failedTests: 0,
            averageTime: 0
        };
    }

    /**
     * Initialize diagnostics panel in the browser
     */
    init() {
        this.createDiagnosticsPanel();
        this.bindEventListeners();
        console.log('🔧 Campus Connect Diagnostics initialized');
    }

    /**
     * Create floating diagnostics panel
     */
    createDiagnosticsPanel() {
        const panel = document.createElement('div');
        panel.id = 'diagnostics-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        panel.innerHTML = `
            <h3>🔧 Pathfinding Diagnostics</h3>
            <div id="stats-display"></div>
            <div id="current-test"></div>
            <button id="run-full-test">Run Full Test Suite</button>
            <button id="test-random-paths">Test Random Paths</button>
            <button id="clear-results">Clear Results</button>
            <div id="test-log"></div>
        `;
        
        document.body.appendChild(panel);
    }

    /**
     * Bind event listeners for diagnostic controls
     */
    bindEventListeners() {
        document.getElementById('run-full-test').addEventListener('click', () => {
            this.runFullTestSuite();
        });

        document.getElementById('test-random-paths').addEventListener('click', () => {
            this.testRandomPaths(10);
        });

        document.getElementById('clear-results').addEventListener('click', () => {
            this.clearResults();
        });
    }

    /**
     * Run comprehensive pathfinding test suite
     */
    async runFullTestSuite() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.log('🚀 Starting full pathfinding test suite...');
        
        // Test all class-to-class combinations
        await this.testAllClassConnections();
        
        // Test stairway connections
        await this.testStairwayConnections();
        
        // Test hub routing
        await this.testHubRouting();
        
        // Test edge cases
        await this.testEdgeCases();
        
        this.isRunning = false;
        this.displayFinalResults();
    }

    /**
     * Test all class-to-class connections
     */
    async testAllClassConnections() {
        this.log('🏫 Testing class-to-class connections...');
        
        const classNodes = this.getClassNodes();
        let testCount = 0;
        
        for (let i = 0; i < classNodes.length; i++) {
            for (let j = i + 1; j < classNodes.length; j++) {
                const result = await this.testPath(classNodes[i], classNodes[j]);
                this.recordTestResult(result);
                testCount++;
                
                if (testCount % 10 === 0) {
                    this.updateProgress(`Tested ${testCount} class connections...`);
                    await this.sleep(50); // Prevent UI blocking
                }
            }
        }
    }

    /**
     * Test stairway connections to ensure floor transition readiness
     */
    async testStairwayConnections() {
        this.log('🪜 Testing stairway connections...');
        
        const stairwayNodes = this.getStairwayNodes();
        const classNodes = this.getClassNodes();
        
        for (const stairway of stairwayNodes) {
            for (const classroom of classNodes.slice(0, 5)) { // Test sample
                const result = await this.testPath(stairway, classroom);
                this.recordTestResult(result);
            }
        }
    }

    /**
     * Test hub routing through intersection nodes
     */
    async testHubRouting() {
        this.log('🎯 Testing hub routing...');
        
        const hubNodes = this.getIntersectionNodes();
        const classNodes = this.getClassNodes();
        
        for (const hub of hubNodes) {
            for (const classroom of classNodes.slice(0, 3)) {
                const result = await this.testPath(hub, classroom);
                this.recordTestResult(result);
            }
        }
    }

    /**
     * Test edge cases and problematic routes
     */
    async testEdgeCases() {
        this.log('⚠️ Testing edge cases...');
        
        // Test specific known issues
        const edgeCases = [
            ['room_310', 'room_305'],
            ['room_314', 'main_hub_4'],
            // Add more edge cases as needed
        ];
        
        for (const [start, end] of edgeCases) {
            const result = await this.testPath(start, end);
            this.recordTestResult(result);
            this.log(`Edge case: ${start} → ${end}: ${result.success ? '✅' : '❌'}`);
        }
    }

    /**
     * Test random path combinations
     */
    async testRandomPaths(count = 10) {
        this.log(`🎲 Testing ${count} random paths...`);
        
        const allNodes = this.getAllNodes();
        
        for (let i = 0; i < count; i++) {
            const start = allNodes[Math.floor(Math.random() * allNodes.length)];
            const end = allNodes[Math.floor(Math.random() * allNodes.length)];
            
            if (start !== end) {
                const result = await this.testPath(start, end);
                this.recordTestResult(result);
            }
        }
        
        this.updateStats();
    }

    /**
     * Test a single path between two nodes
     */
    async testPath(startNode, endNode) {
        const startTime = performance.now();
        
        try {
            // Use the campus pathfinding system
            const path = window.astarPath && window.campusGraph 
                ? window.astarPath(window.campusGraph, window.campusNodes, startNode, endNode)
                : null;
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            const result = {
                start: startNode,
                end: endNode,
                success: path && path.length > 0,
                path: path,
                duration: duration,
                timestamp: new Date().toISOString()
            };
            
            return result;
        } catch (error) {
            return {
                start: startNode,
                end: endNode,
                success: false,
                error: error.message,
                duration: performance.now() - startTime,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Record test result and update statistics
     */
    recordTestResult(result) {
        this.testResults.push(result);
        this.pathfindingStats.totalTests++;
        
        if (result.success) {
            this.pathfindingStats.successfulTests++;
        } else {
            this.pathfindingStats.failedTests++;
        }
        
        this.updateStats();
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const successRate = this.pathfindingStats.totalTests > 0 
            ? (this.pathfindingStats.successfulTests / this.pathfindingStats.totalTests * 100).toFixed(1)
            : 0;
        
        const avgTime = this.testResults.length > 0
            ? (this.testResults.reduce((sum, r) => sum + r.duration, 0) / this.testResults.length).toFixed(2)
            : 0;
        
        document.getElementById('stats-display').innerHTML = `
            <strong>Statistics:</strong><br>
            Total Tests: ${this.pathfindingStats.totalTests}<br>
            Success Rate: ${successRate}%<br>
            Average Time: ${avgTime}ms<br>
            Failed: ${this.pathfindingStats.failedTests}
        `;
    }

    /**
     * Update progress display
     */
    updateProgress(message) {
        document.getElementById('current-test').textContent = message;
    }

    /**
     * Log message to diagnostic panel
     */
    log(message) {
        const logElement = document.getElementById('test-log');
        const timestamp = new Date().toLocaleTimeString();
        logElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        logElement.scrollTop = logElement.scrollHeight;
        console.log(`[Diagnostics] ${message}`);
    }

    /**
     * Display final test results
     */
    displayFinalResults() {
        const successRate = (this.pathfindingStats.successfulTests / this.pathfindingStats.totalTests * 100).toFixed(1);
        
        this.log(`🎉 Test suite completed!`);
        this.log(`✅ Success rate: ${successRate}%`);
        this.log(`⚡ Total tests: ${this.pathfindingStats.totalTests}`);
        
        if (this.pathfindingStats.failedTests > 0) {
            this.log(`❌ Failed tests: ${this.pathfindingStats.failedTests}`);
            this.logFailedTests();
        }
    }

    /**
     * Log details of failed tests
     */
    logFailedTests() {
        const failedTests = this.testResults.filter(r => !r.success);
        failedTests.forEach(test => {
            this.log(`❌ ${test.start} → ${test.end}: ${test.error || 'No path found'}`);
        });
    }

    /**
     * Clear all test results
     */
    clearResults() {
        this.testResults = [];
        this.pathfindingStats = {
            totalTests: 0,
            successfulTests: 0,
            failedTests: 0,
            averageTime: 0
        };
        document.getElementById('test-log').innerHTML = '';
        this.updateStats();
        this.log('🧹 Results cleared');
    }

    /**
     * Helper functions to get different node types
     */
    getClassNodes() {
        return window.campusNodes ? window.campusNodes.filter(n => n.type === 'class').map(n => n.id) : [];
    }

    getStairwayNodes() {
        return window.campusNodes ? window.campusNodes.filter(n => n.type === 'stairway').map(n => n.id) : [];
    }

    getIntersectionNodes() {
        return window.campusNodes ? window.campusNodes.filter(n => n.type === 'intersection').map(n => n.id) : [];
    }

    getAllNodes() {
        return window.campusNodes ? window.campusNodes.map(n => n.id) : [];
    }

    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize diagnostics when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.campusDiagnostics = new CampusConnectDiagnostics();
            window.campusDiagnostics.init();
        }, 2000); // Wait for campus system to load
    });
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampusConnectDiagnostics;
}