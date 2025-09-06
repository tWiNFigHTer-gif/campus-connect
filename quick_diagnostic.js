/**
 * Quick Diagnostic Tool for Campus Connect
 * Fast checks for common pathfinding issues
 */

class QuickDiagnostic {
    /**
     * Run all quick diagnostic checks
     */
    static async runAll() {
        console.log('⚡ Running quick diagnostics...');
        
        const results = {
            timestamp: new Date().toISOString(),
            checks: []
        };
        
        // Check 1: Campus data availability
        results.checks.push(this.checkCampusData());
        
        // Check 2: Graph connectivity
        results.checks.push(this.checkGraphConnectivity());
        
        // Check 3: Third floor rooms
        results.checks.push(this.checkThirdFloorRooms());
        
        // Check 4: Critical paths
        results.checks.push(this.checkCriticalPaths());
        
        // Check 5: Performance
        results.checks.push(await this.checkPerformance());
        
        this.displayResults(results);
        return results;
    }
    
    /**
     * Check if campus data is properly loaded
     */
    static checkCampusData() {
        const check = {
            name: 'Campus Data Availability',
            passed: true,
            issues: []
        };
        
        if (!window.campusNodes) {
            check.passed = false;
            check.issues.push('campusNodes not loaded');
        } else if (!Array.isArray(window.campusNodes)) {
            check.passed = false;
            check.issues.push('campusNodes is not an array');
        } else if (window.campusNodes.length === 0) {
            check.passed = false;
            check.issues.push('campusNodes is empty');
        }
        
        if (!window.campusGraph) {
            check.passed = false;
            check.issues.push('campusGraph not loaded');
        } else if (typeof window.campusGraph !== 'object') {
            check.passed = false;
            check.issues.push('campusGraph is not an object');
        } else if (Object.keys(window.campusGraph).length === 0) {
            check.passed = false;
            check.issues.push('campusGraph is empty');
        }
        
        if (!window.astarPath) {
            check.passed = false;
            check.issues.push('astarPath function not available');
        } else if (typeof window.astarPath !== 'function') {
            check.passed = false;
            check.issues.push('astarPath is not a function');
        }
        
        if (check.passed) {
            check.summary = `✅ Campus data loaded: ${window.campusNodes.length} nodes, ${Object.keys(window.campusGraph).length} graph entries`;
        } else {
            check.summary = `❌ Campus data issues: ${check.issues.join(', ')}`;
        }
        
        return check;
    }
    
    /**
     * Check graph connectivity and integrity
     */
    static checkGraphConnectivity() {
        const check = {
            name: 'Graph Connectivity',
            passed: true,
            issues: []
        };
        
        if (!window.campusGraph || !window.campusNodes) {
            check.passed = false;
            check.issues.push('Campus data not available');
            check.summary = '❌ Cannot check connectivity - no data';
            return check;
        }
        
        const nodes = window.campusNodes;
        const graph = window.campusGraph;
        
        // Check for isolated nodes
        let isolatedCount = 0;
        for (const node of nodes) {
            if (!graph[node.id] || Object.keys(graph[node.id]).length === 0) {
                isolatedCount++;
                if (isolatedCount <= 3) { // Only report first 3
                    check.issues.push(`Isolated node: ${node.id}`);
                }
            }
        }
        
        if (isolatedCount > 0) {
            check.passed = false;
            if (isolatedCount > 3) {
                check.issues.push(`...and ${isolatedCount - 3} more isolated nodes`);
            }
        }
        
        // Check bidirectional consistency
        let bidirectionalIssues = 0;
        for (const nodeId in graph) {
            for (const neighborId in graph[nodeId]) {
                if (!graph[neighborId] || !graph[neighborId][nodeId]) {
                    bidirectionalIssues++;
                    if (bidirectionalIssues <= 3) {
                        check.issues.push(`Missing reverse: ${nodeId} ↔ ${neighborId}`);
                    }
                }
            }
        }
        
        if (bidirectionalIssues > 0) {
            check.passed = false;
            if (bidirectionalIssues > 3) {
                check.issues.push(`...and ${bidirectionalIssues - 3} more bidirectional issues`);
            }
        }
        
        if (check.passed) {
            check.summary = `✅ Graph connectivity good: ${nodes.length - isolatedCount}/${nodes.length} nodes connected`;
        } else {
            check.summary = `❌ Graph issues: ${isolatedCount} isolated, ${bidirectionalIssues} bidirectional problems`;
        }
        
        return check;
    }
    
    /**
     * Check third floor room availability
     */
    static checkThirdFloorRooms() {
        const check = {
            name: 'Third Floor Rooms',
            passed: true,
            issues: []
        };
        
        if (!window.campusNodes) {
            check.passed = false;
            check.issues.push('No campus nodes available');
            check.summary = '❌ Cannot check third floor rooms - no data';
            return check;
        }
        
        const thirdFloorRooms = window.campusNodes.filter(node => 
            node.type === 'class' && (
                node.id.includes('room_3') || 
                node.label.includes('3F') ||
                node.id.includes('3') ||
                node.label.includes('310') ||
                node.label.includes('305') ||
                node.label.includes('314')
            )
        );
        
        if (thirdFloorRooms.length === 0) {
            check.passed = false;
            check.issues.push('No third floor rooms found');
        }
        
        // Check for specific important rooms
        const importantRooms = ['room_310', 'room_305', 'room_314'];
        const foundRooms = [];
        const missingRooms = [];
        
        for (const roomId of importantRooms) {
            const found = window.campusNodes.find(n => 
                n.id === roomId || 
                n.label.includes(roomId.replace('room_', ''))
            );
            
            if (found) {
                foundRooms.push(roomId);
            } else {
                missingRooms.push(roomId);
            }
        }
        
        if (missingRooms.length > 0) {
            check.passed = false;
            check.issues.push(`Missing important rooms: ${missingRooms.join(', ')}`);
        }
        
        if (check.passed) {
            check.summary = `✅ Third floor rooms available: ${thirdFloorRooms.length} total, key rooms: ${foundRooms.join(', ')}`;
        } else {
            check.summary = `❌ Third floor issues: ${check.issues.join(', ')}`;
        }
        
        return check;
    }
    
    /**
     * Check critical pathfinding routes
     */
    static checkCriticalPaths() {
        const check = {
            name: 'Critical Paths',
            passed: true,
            issues: []
        };
        
        if (!window.astarPath || !window.campusGraph || !window.campusNodes) {
            check.passed = false;
            check.issues.push('Pathfinding system not available');
            check.summary = '❌ Cannot test paths - system not ready';
            return check;
        }
        
        // Test critical path combinations
        const criticalPaths = [
            ['room_310', 'room_305'],
            ['room_314', 'main_hub_4'],
            ['room_301', 'room_321']
        ];
        
        let workingPaths = 0;
        const pathResults = [];
        
        for (const [start, end] of criticalPaths) {
            try {
                const path = window.astarPath(window.campusGraph, window.campusNodes, start, end);
                if (path && path.length > 0) {
                    workingPaths++;
                    pathResults.push(`${start} → ${end}: ✅ (${path.length} steps)`);
                } else {
                    check.issues.push(`No path: ${start} → ${end}`);
                    pathResults.push(`${start} → ${end}: ❌`);
                }
            } catch (error) {
                check.issues.push(`Error testing ${start} → ${end}: ${error.message}`);
                pathResults.push(`${start} → ${end}: ❌ (error)`);
            }
        }
        
        if (workingPaths < criticalPaths.length) {
            check.passed = false;
        }
        
        if (check.passed) {
            check.summary = `✅ All ${criticalPaths.length} critical paths working`;
        } else {
            check.summary = `❌ Path issues: ${workingPaths}/${criticalPaths.length} working`;
        }
        
        check.pathResults = pathResults;
        return check;
    }
    
    /**
     * Check pathfinding performance
     */
    static async checkPerformance() {
        const check = {
            name: 'Performance',
            passed: true,
            issues: []
        };
        
        if (!window.astarPath || !window.campusGraph || !window.campusNodes) {
            check.passed = false;
            check.issues.push('Pathfinding system not available');
            check.summary = '❌ Cannot test performance - system not ready';
            return check;
        }
        
        const nodes = window.campusNodes;
        if (nodes.length < 2) {
            check.passed = false;
            check.issues.push('Not enough nodes for performance testing');
            check.summary = '❌ Insufficient nodes for performance test';
            return check;
        }
        
        // Test 5 random paths
        const durations = [];
        const testCount = 5;
        
        for (let i = 0; i < testCount; i++) {
            const start = nodes[Math.floor(Math.random() * nodes.length)];
            const end = nodes[Math.floor(Math.random() * nodes.length)];
            
            if (start.id !== end.id) {
                const startTime = performance.now();
                try {
                    const path = window.astarPath(window.campusGraph, window.campusNodes, start.id, end.id);
                    const endTime = performance.now();
                    
                    if (path && path.length > 0) {
                        durations.push(endTime - startTime);
                    }
                } catch (error) {
                    // Skip errors for performance test
                }
            }
        }
        
        if (durations.length === 0) {
            check.passed = false;
            check.issues.push('No successful pathfinding operations for timing');
            check.summary = '❌ Performance test failed - no successful operations';
            return check;
        }
        
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const maxDuration = Math.max(...durations);
        
        // Performance thresholds
        const avgThreshold = 100; // 100ms average
        const maxThreshold = 200; // 200ms maximum
        
        if (avgDuration > avgThreshold) {
            check.passed = false;
            check.issues.push(`Average duration too high: ${avgDuration.toFixed(2)}ms > ${avgThreshold}ms`);
        }
        
        if (maxDuration > maxThreshold) {
            check.passed = false;
            check.issues.push(`Maximum duration too high: ${maxDuration.toFixed(2)}ms > ${maxThreshold}ms`);
        }
        
        if (check.passed) {
            check.summary = `✅ Performance good: avg ${avgDuration.toFixed(2)}ms, max ${maxDuration.toFixed(2)}ms`;
        } else {
            check.summary = `❌ Performance issues: avg ${avgDuration.toFixed(2)}ms, max ${maxDuration.toFixed(2)}ms`;
        }
        
        check.avgDuration = avgDuration;
        check.maxDuration = maxDuration;
        return check;
    }
    
    /**
     * Display diagnostic results
     */
    static displayResults(results) {
        console.log('\n⚡ Quick Diagnostic Results:');
        console.log('=' .repeat(50));
        
        let overallPassed = true;
        
        for (const check of results.checks) {
            console.log(`\n${check.name}:`);
            console.log(`  ${check.summary}`);
            
            if (!check.passed) {
                overallPassed = false;
                if (check.issues && check.issues.length > 0) {
                    check.issues.forEach(issue => {
                        console.log(`    ⚠️ ${issue}`);
                    });
                }
            }
            
            if (check.pathResults) {
                check.pathResults.forEach(result => {
                    console.log(`    ${result}`);
                });
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`Overall Status: ${overallPassed ? '✅ PASSED' : '❌ ISSUES FOUND'}`);
        console.log(`Timestamp: ${results.timestamp}`);
        
        // Also display in UI if diagnostic panel exists
        this.updateDiagnosticPanel(results);
    }
    
    /**
     * Update diagnostic panel in UI if it exists
     */
    static updateDiagnosticPanel(results) {
        const panel = document.getElementById('quick-diagnostic-panel');
        if (!panel) {
            // Create panel if it doesn't exist
            this.createDiagnosticPanel();
        }
        
        const resultsContainer = document.getElementById('quick-diagnostic-results');
        if (resultsContainer) {
            let html = '<h4>Quick Diagnostic Results</h4>';
            
            for (const check of results.checks) {
                const statusIcon = check.passed ? '✅' : '❌';
                html += `
                    <div style="margin: 10px 0; padding: 10px; background: ${check.passed ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
                        <strong>${statusIcon} ${check.name}</strong><br>
                        ${check.summary}
                    </div>
                `;
            }
            
            resultsContainer.innerHTML = html;
        }
    }
    
    /**
     * Create diagnostic panel UI
     */
    static createDiagnosticPanel() {
        const panel = document.createElement('div');
        panel.id = 'quick-diagnostic-panel';
        panel.style.cssText = `
            position: fixed;
            top: 100px;
            left: 10px;
            width: 300px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #007bff;
            border-radius: 10px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        panel.innerHTML = `
            <h3 style="margin-top: 0; color: #007bff;">⚡ Quick Diagnostics</h3>
            <button id="run-quick-diagnostic" style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Run Diagnostics</button>
            <button id="close-diagnostic-panel" style="background: #6c757d; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-left: 5px;">Close</button>
            <div id="quick-diagnostic-results" style="margin-top: 15px;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('run-quick-diagnostic').addEventListener('click', () => {
            this.runAll();
        });
        
        document.getElementById('close-diagnostic-panel').addEventListener('click', () => {
            panel.remove();
        });
    }
}

// Auto-run diagnostics when page loads (with delay)
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Create diagnostic panel
            QuickDiagnostic.createDiagnosticPanel();
            
            // Auto-run diagnostics if campus data is available
            if (window.campusNodes && window.campusGraph && window.astarPath) {
                console.log('⚡ Auto-running quick diagnostics...');
                QuickDiagnostic.runAll();
            } else {
                console.log('⏳ Campus data not ready - use "Run Diagnostics" button when ready');
            }
        }, 3000); // Wait 3 seconds for campus system to load
    });
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.QuickDiagnostic = QuickDiagnostic;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickDiagnostic;
}