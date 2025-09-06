/**
 * Manual Path Tests for Campus Connect
 * Interactive testing tool for manual verification
 */

class ManualPathTests {
    constructor() {
        this.testHistory = [];
        this.currentTest = null;
    }

    /**
     * Initialize manual testing interface
     */
    init() {
        this.createTestInterface();
        this.bindEvents();
        console.log('🔧 Manual Path Tests initialized');
    }

    /**
     * Create interactive testing interface
     */
    createTestInterface() {
        const panel = document.createElement('div');
        panel.id = 'manual-test-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 320px;
            width: 350px;
            background: rgba(40, 167, 69, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        
        panel.innerHTML = `
            <h3 style="margin-top: 0; color: #fff;">🔧 Manual Path Tests</h3>
            
            <div style="margin: 15px 0;">
                <label>Start Node:</label><br>
                <select id="start-node-select" style="width: 100%; padding: 5px; margin: 5px 0;">
                    <option value="">Select start node...</option>
                </select>
            </div>
            
            <div style="margin: 15px 0;">
                <label>End Node:</label><br>
                <select id="end-node-select" style="width: 100%; padding: 5px; margin: 5px 0;">
                    <option value="">Select end node...</option>
                </select>
            </div>
            
            <div style="margin: 15px 0;">
                <button id="test-path-btn" style="background: #fff; color: #28a745; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin: 2px;">Test Path</button>
                <button id="test-reverse-btn" style="background: #fff; color: #28a745; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin: 2px;">Test Reverse</button>
                <button id="clear-history-btn" style="background: #fff; color: #28a745; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin: 2px;">Clear</button>
            </div>
            
            <div style="margin: 15px 0;">
                <strong>Quick Tests:</strong><br>
                <button id="test-310-305" style="background: #ffc107; color: #000; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin: 2px; font-size: 11px;">310→305</button>
                <button id="test-314-hub4" style="background: #ffc107; color: #000; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin: 2px; font-size: 11px;">314→Hub4</button>
                <button id="test-random" style="background: #ffc107; color: #000; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin: 2px; font-size: 11px;">Random</button>
            </div>
            
            <div id="test-result" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin: 10px 0; min-height: 60px; max-height: 150px; overflow-y: auto;"></div>
            
            <div id="test-history" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">
                <strong>Recent Tests:</strong><br>
                <div id="history-list">No tests run yet</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Populate node dropdowns
        this.populateNodeDropdowns();
    }

    /**
     * Populate dropdown menus with available nodes
     */
    populateNodeDropdowns() {
        const startSelect = document.getElementById('start-node-select');
        const endSelect = document.getElementById('end-node-select');
        
        if (!window.campusNodes) {
            console.warn('Campus nodes not available for manual testing');
            return;
        }
        
        // Clear existing options (keep first placeholder option)
        startSelect.innerHTML = '<option value="">Select start node...</option>';
        endSelect.innerHTML = '<option value="">Select end node...</option>';
        
        // Group nodes by type for better organization
        const nodesByType = {};
        
        window.campusNodes.forEach(node => {
            if (!nodesByType[node.type]) {
                nodesByType[node.type] = [];
            }
            nodesByType[node.type].push(node);
        });
        
        // Add options grouped by type
        Object.keys(nodesByType).sort().forEach(type => {
            // Create optgroup
            const startGroup = document.createElement('optgroup');
            startGroup.label = type.charAt(0).toUpperCase() + type.slice(1) + ' Nodes';
            
            const endGroup = document.createElement('optgroup');
            endGroup.label = type.charAt(0).toUpperCase() + type.slice(1) + ' Nodes';
            
            // Sort nodes within type
            nodesByType[type].sort((a, b) => a.label.localeCompare(b.label)).forEach(node => {
                const startOption = document.createElement('option');
                startOption.value = node.id;
                startOption.textContent = `${node.label} (${node.id})`;
                startGroup.appendChild(startOption);
                
                const endOption = document.createElement('option');
                endOption.value = node.id;
                endOption.textContent = `${node.label} (${node.id})`;
                endGroup.appendChild(endOption);
            });
            
            startSelect.appendChild(startGroup);
            endSelect.appendChild(endGroup);
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        document.getElementById('test-path-btn').addEventListener('click', () => {
            const start = document.getElementById('start-node-select').value;
            const end = document.getElementById('end-node-select').value;
            this.testPath(start, end);
        });
        
        document.getElementById('test-reverse-btn').addEventListener('click', () => {
            const start = document.getElementById('start-node-select').value;
            const end = document.getElementById('end-node-select').value;
            this.testPath(end, start); // Reverse the order
        });
        
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('test-310-305').addEventListener('click', () => {
            this.testPath('room_310', 'room_305');
        });
        
        document.getElementById('test-314-hub4').addEventListener('click', () => {
            this.testPath('room_314', 'main_hub_4');
        });
        
        document.getElementById('test-random').addEventListener('click', () => {
            this.testRandomPath();
        });
    }

    /**
     * Test a specific path between two nodes
     */
    testPath(startId, endId) {
        if (!startId || !endId) {
            this.displayResult('❌ Error: Please select both start and end nodes');
            return;
        }
        
        if (startId === endId) {
            this.displayResult('⚠️ Warning: Start and end nodes are the same');
            return;
        }
        
        // Find node details
        const startNode = window.campusNodes?.find(n => n.id === startId);
        const endNode = window.campusNodes?.find(n => n.id === endId);
        
        if (!startNode || !endNode) {
            this.displayResult(`❌ Error: Node not found (start: ${!!startNode}, end: ${!!endNode})`);
            return;
        }
        
        // Test pathfinding
        const startTime = performance.now();
        let path = null;
        let error = null;
        
        try {
            if (window.astarPath) {
                path = window.astarPath(window.campusGraph, window.campusNodes, startId, endId);
            } else {
                error = 'A* pathfinding function not available';
            }
        } catch (e) {
            error = e.message;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Create test result
        const result = {
            start: startId,
            startLabel: startNode.label,
            end: endId,
            endLabel: endNode.label,
            success: path && path.length > 0,
            path: path,
            duration: duration,
            error: error,
            timestamp: new Date().toISOString()
        };
        
        this.currentTest = result;
        this.testHistory.unshift(result); // Add to beginning
        
        // Keep only last 10 tests
        if (this.testHistory.length > 10) {
            this.testHistory = this.testHistory.slice(0, 10);
        }
        
        this.displayResult(this.formatTestResult(result));
        this.updateHistory();
        
        // Also log to console
        const status = result.success ? '✅' : '❌';
        console.log(`${status} Manual test: ${startNode.label} → ${endNode.label} | ${result.success ? `${path.length} steps` : 'No path'} | ${duration.toFixed(2)}ms`);
    }

    /**
     * Test a random path
     */
    testRandomPath() {
        if (!window.campusNodes || window.campusNodes.length < 2) {
            this.displayResult('❌ Error: Not enough nodes for random test');
            return;
        }
        
        const nodes = window.campusNodes;
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        let endNode = nodes[Math.floor(Math.random() * nodes.length)];
        
        // Ensure different nodes
        while (endNode.id === startNode.id && nodes.length > 1) {
            endNode = nodes[Math.floor(Math.random() * nodes.length)];
        }
        
        // Update dropdowns to show selected nodes
        document.getElementById('start-node-select').value = startNode.id;
        document.getElementById('end-node-select').value = endNode.id;
        
        this.testPath(startNode.id, endNode.id);
    }

    /**
     * Format test result for display
     */
    formatTestResult(result) {
        const status = result.success ? '✅' : '❌';
        const duration = result.duration.toFixed(2);
        
        let output = `${status} <strong>${result.startLabel} → ${result.endLabel}</strong><br>`;
        
        if (result.success) {
            output += `Path found: ${result.path.length} steps (${duration}ms)<br>`;
            output += `Route: ${result.path.join(' → ')}<br>`;
            
            // Calculate total distance if possible
            const totalDistance = this.calculatePathDistance(result.path);
            if (totalDistance > 0) {
                output += `Distance: ${totalDistance.toFixed(1)}px<br>`;
            }
        } else {
            output += `No path found (${duration}ms)<br>`;
            if (result.error) {
                output += `Error: ${result.error}<br>`;
            }
        }
        
        output += `<small>Tested at ${new Date(result.timestamp).toLocaleTimeString()}</small>`;
        
        return output;
    }

    /**
     * Calculate total distance of a path
     */
    calculatePathDistance(path) {
        if (!path || path.length < 2 || !window.campusGraph) return 0;
        
        let totalDistance = 0;
        
        for (let i = 0; i < path.length - 1; i++) {
            const currentNode = path[i];
            const nextNode = path[i + 1];
            
            if (window.campusGraph[currentNode] && window.campusGraph[currentNode][nextNode]) {
                totalDistance += window.campusGraph[currentNode][nextNode];
            }
        }
        
        return totalDistance;
    }

    /**
     * Display test result
     */
    displayResult(html) {
        const resultDiv = document.getElementById('test-result');
        resultDiv.innerHTML = html;
    }

    /**
     * Update test history display
     */
    updateHistory() {
        const historyDiv = document.getElementById('history-list');
        
        if (this.testHistory.length === 0) {
            historyDiv.innerHTML = 'No tests run yet';
            return;
        }
        
        let html = '';
        this.testHistory.forEach((test, index) => {
            const status = test.success ? '✅' : '❌';
            const time = new Date(test.timestamp).toLocaleTimeString();
            const pathInfo = test.success ? `${test.path.length} steps` : 'Failed';
            
            html += `
                <div style="padding: 5px; margin: 3px 0; background: rgba(255,255,255,0.1); border-radius: 3px; font-size: 11px;">
                    ${status} ${test.startLabel} → ${test.endLabel}<br>
                    <small>${pathInfo} | ${test.duration.toFixed(1)}ms | ${time}</small>
                </div>
            `;
        });
        
        historyDiv.innerHTML = html;
    }

    /**
     * Clear test history
     */
    clearHistory() {
        this.testHistory = [];
        this.currentTest = null;
        this.updateHistory();
        this.displayResult('History cleared');
    }

    /**
     * Get test statistics
     */
    getStatistics() {
        if (this.testHistory.length === 0) {
            return { totalTests: 0, successRate: 0, averageDuration: 0 };
        }
        
        const successful = this.testHistory.filter(t => t.success).length;
        const successRate = (successful / this.testHistory.length) * 100;
        const averageDuration = this.testHistory.reduce((sum, t) => sum + t.duration, 0) / this.testHistory.length;
        
        return {
            totalTests: this.testHistory.length,
            successfulTests: successful,
            failedTests: this.testHistory.length - successful,
            successRate: successRate,
            averageDuration: averageDuration
        };
    }

    /**
     * Export test results
     */
    exportResults() {
        const stats = this.getStatistics();
        const exportData = {
            timestamp: new Date().toISOString(),
            statistics: stats,
            testHistory: this.testHistory,
            systemInfo: {
                nodesAvailable: window.campusNodes ? window.campusNodes.length : 0,
                graphNodesAvailable: window.campusGraph ? Object.keys(window.campusGraph).length : 0,
                pathfindingAvailable: !!window.astarPath
            }
        };
        
        console.log('📊 Manual Test Results Export:', exportData);
        
        // Could also download as JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `manual-path-tests-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.displayResult(`📊 Test results exported (${stats.totalTests} tests, ${stats.successRate.toFixed(1)}% success rate)`);
    }

    /**
     * Run batch test on predefined important paths
     */
    runBatchTest() {
        const importantPaths = [
            ['room_310', 'room_305'],
            ['room_314', 'main_hub_4'],
            ['room_301', 'room_321'],
            ['room_302', 'room_320'],
            ['room_303', 'room_319']
        ];
        
        this.displayResult('🔄 Running batch test...');
        
        let completedTests = 0;
        const batchResults = [];
        
        const runNextTest = () => {
            if (completedTests >= importantPaths.length) {
                // All tests completed
                const successful = batchResults.filter(r => r.success).length;
                const successRate = (successful / batchResults.length) * 100;
                
                this.displayResult(`
                    ✅ Batch test completed!<br>
                    Results: ${successful}/${batchResults.length} paths successful<br>
                    Success rate: ${successRate.toFixed(1)}%<br>
                    Check history for details.
                `);
                
                return;
            }
            
            const [start, end] = importantPaths[completedTests];
            
            // Update display
            this.displayResult(`🔄 Testing batch ${completedTests + 1}/${importantPaths.length}: ${start} → ${end}`);
            
            // Run test after short delay
            setTimeout(() => {
                this.testPath(start, end);
                if (this.currentTest) {
                    batchResults.push(this.currentTest);
                }
                completedTests++;
                runNextTest();
            }, 500);
        };
        
        runNextTest();
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.campusNodes) {
                window.manualPathTests = new ManualPathTests();
                window.manualPathTests.init();
                console.log('🔧 Manual Path Tests interface loaded');
            } else {
                console.log('⏳ Waiting for campus data before loading manual tests...');
                
                // Try again after more time
                setTimeout(() => {
                    if (window.campusNodes) {
                        window.manualPathTests = new ManualPathTests();
                        window.manualPathTests.init();
                        console.log('🔧 Manual Path Tests interface loaded (delayed)');
                    }
                }, 3000);
            }
        }, 2000);
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManualPathTests;
}