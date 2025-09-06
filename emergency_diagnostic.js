/**
 * Emergency Diagnostic Tool for Campus Connect
 * Quick emergency checks when things go wrong
 */

class EmergencyDiagnostic {
    static async runEmergencyCheck() {
        console.log('🚨 EMERGENCY DIAGNOSTIC CHECK');
        console.log('================================');
        
        const issues = [];
        const fixes = [];
        
        // 1. Check if page has loaded properly
        if (document.readyState !== 'complete') {
            issues.push('❌ Page not fully loaded');
        } else {
            console.log('✅ Page loaded');
        }
        
        // 2. Check campus data
        if (!window.campusNodes) {
            issues.push('❌ campusNodes not loaded');
            fixes.push('Reload page or check data loading');
        } else if (!Array.isArray(window.campusNodes)) {
            issues.push('❌ campusNodes is not an array');
        } else if (window.campusNodes.length === 0) {
            issues.push('❌ campusNodes is empty');
        } else {
            console.log(`✅ Campus nodes: ${window.campusNodes.length} loaded`);
        }
        
        // 3. Check graph data
        if (!window.campusGraph) {
            issues.push('❌ campusGraph not loaded');
            fixes.push('Check graph data loading');
        } else if (typeof window.campusGraph !== 'object') {
            issues.push('❌ campusGraph is not an object');
        } else if (Object.keys(window.campusGraph).length === 0) {
            issues.push('❌ campusGraph is empty');
        } else {
            console.log(`✅ Campus graph: ${Object.keys(window.campusGraph).length} nodes`);
        }
        
        // 4. Check pathfinding function
        if (!window.astarPath) {
            issues.push('❌ astarPath function not available');
            fixes.push('Check if A* pathfinding is properly loaded');
        } else if (typeof window.astarPath !== 'function') {
            issues.push('❌ astarPath is not a function');
        } else {
            console.log('✅ A* pathfinding function available');
        }
        
        // 5. Quick pathfinding test
        if (window.astarPath && window.campusGraph && window.campusNodes) {
            try {
                const nodes = window.campusNodes.filter(n => n.type === 'class');
                if (nodes.length >= 2) {
                    const path = window.astarPath(window.campusGraph, window.campusNodes, nodes[0].id, nodes[1].id);
                    if (path && path.length > 0) {
                        console.log('✅ Basic pathfinding working');
                    } else {
                        issues.push('❌ Pathfinding returns no results');
                        fixes.push('Check graph connections');
                    }
                } else {
                    issues.push('⚠️ Not enough class nodes for testing');
                }
            } catch (error) {
                issues.push(`❌ Pathfinding error: ${error.message}`);
                fixes.push('Check pathfinding function implementation');
            }
        }
        
        // 6. Check critical elements
        const criticalElements = ['status', 'fromInput', 'toInput'];
        for (const elementId of criticalElements) {
            if (!document.getElementById(elementId)) {
                issues.push(`❌ Missing element: ${elementId}`);
                fixes.push(`Add element with id="${elementId}"`);
            } else {
                console.log(`✅ Element found: ${elementId}`);
            }
        }
        
        // 7. Check for console errors
        if (window.console && window.console.error) {
            console.log('✅ Console available for error reporting');
        }
        
        // Display results
        console.log('\n🎯 EMERGENCY DIAGNOSTIC RESULTS:');
        console.log('==================================');
        
        if (issues.length === 0) {
            console.log('🎉 NO CRITICAL ISSUES FOUND - System appears healthy');
        } else {
            console.log(`⚠️ ${issues.length} ISSUES FOUND:`);
            issues.forEach(issue => console.log(`   ${issue}`));
            
            if (fixes.length > 0) {
                console.log('\n💡 SUGGESTED FIXES:');
                fixes.forEach(fix => console.log(`   • ${fix}`));
            }
        }
        
        // Return summary
        return {
            healthy: issues.length === 0,
            issueCount: issues.length,
            issues: issues,
            fixes: fixes,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Quick fix common issues
     */
    static async quickFix() {
        console.log('🔧 ATTEMPTING QUICK FIXES...');
        
        const fixes = [];
        
        // Try to reload campus data if missing
        if (!window.campusNodes || !window.campusGraph) {
            console.log('📊 Attempting to reload campus data...');
            try {
                // This would need to call the actual data loading function
                if (window.initializeCampusConnect) {
                    await window.initializeCampusConnect();
                    fixes.push('Reloaded campus data');
                }
            } catch (error) {
                console.error('❌ Failed to reload campus data:', error);
            }
        }
        
        // Clear and reset search inputs
        const fromInput = document.getElementById('fromInput');
        const toInput = document.getElementById('toInput');
        
        if (fromInput) {
            fromInput.value = '';
            fixes.push('Reset from input');
        }
        
        if (toInput) {
            toInput.value = '';
            fixes.push('Reset to input');
        }
        
        // Clear status
        const status = document.getElementById('status');
        if (status) {
            status.textContent = 'System reset - Ready for navigation';
            fixes.push('Reset status message');
        }
        
        // Clear any existing path
        if (window.clearPath) {
            window.clearPath();
            fixes.push('Cleared existing path');
        }
        
        console.log(`✅ Applied ${fixes.length} quick fixes`);
        return fixes;
    }
    
    /**
     * Test critical pathfinding routes
     */
    static testCriticalRoutes() {
        console.log('🧪 TESTING CRITICAL ROUTES...');
        
        if (!window.astarPath || !window.campusGraph || !window.campusNodes) {
            console.log('❌ Cannot test routes - system not ready');
            return false;
        }
        
        const criticalRoutes = [
            ['room_310', 'room_305'],
            ['room_314', 'main_hub_4'],
            ['room_301', 'room_321']
        ];
        
        let workingRoutes = 0;
        
        for (const [start, end] of criticalRoutes) {
            try {
                const path = window.astarPath(window.campusGraph, window.campusNodes, start, end);
                if (path && path.length > 0) {
                    workingRoutes++;
                    console.log(`✅ ${start} → ${end}: Working (${path.length} steps)`);
                } else {
                    console.log(`❌ ${start} → ${end}: No path found`);
                }
            } catch (error) {
                console.log(`💥 ${start} → ${end}: Error - ${error.message}`);
            }
        }
        
        const successRate = (workingRoutes / criticalRoutes.length) * 100;
        console.log(`🎯 Route Test Results: ${workingRoutes}/${criticalRoutes.length} working (${successRate.toFixed(1)}%)`);
        
        return successRate >= 75; // 75% success rate considered acceptable
    }
    
    /**
     * Create emergency diagnostic panel
     */
    static createEmergencyPanel() {
        // Remove existing panel if present
        const existing = document.getElementById('emergency-diagnostic');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.id = 'emergency-diagnostic';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            z-index: 99999;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
            border: 2px solid #fff;
        `;
        
        panel.innerHTML = `
            <h2 style="margin-top: 0; text-align: center;">🚨 EMERGENCY DIAGNOSTIC</h2>
            
            <div style="margin: 15px 0;">
                <button id="run-emergency-check" style="width: 100%; background: #fff; color: #dc3545; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 5px 0;">🔍 Run Full Diagnostic</button>
                <button id="quick-fix-btn" style="width: 100%; background: #fff; color: #dc3545; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 5px 0;">🔧 Apply Quick Fixes</button>
                <button id="test-routes-btn" style="width: 100%; background: #fff; color: #dc3545; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; margin: 5px 0;">🧪 Test Critical Routes</button>
                <button id="close-emergency-btn" style="width: 100%; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid #fff; padding: 8px; border-radius: 5px; cursor: pointer; margin: 5px 0;">❌ Close Panel</button>
            </div>
            
            <div id="emergency-results" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; min-height: 100px; max-height: 300px; overflow-y: auto; font-size: 12px;"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('run-emergency-check').addEventListener('click', async () => {
            const results = await this.runEmergencyCheck();
            this.displayEmergencyResults(results);
        });
        
        document.getElementById('quick-fix-btn').addEventListener('click', async () => {
            const fixes = await this.quickFix();
            document.getElementById('emergency-results').innerHTML = `
                <div style="color: #90EE90;">🔧 Applied ${fixes.length} quick fixes:</div>
                ${fixes.map(fix => `<div>• ${fix}</div>`).join('')}
                <div style="margin-top: 10px;">Run diagnostic again to verify fixes.</div>
            `;
        });
        
        document.getElementById('test-routes-btn').addEventListener('click', () => {
            const success = this.testCriticalRoutes();
            document.getElementById('emergency-results').innerHTML = `
                <div style="color: ${success ? '#90EE90' : '#FFB6C1'};">
                    🧪 Route testing ${success ? 'PASSED' : 'FAILED'}
                </div>
                <div>Check console for detailed results.</div>
            `;
        });
        
        document.getElementById('close-emergency-btn').addEventListener('click', () => {
            panel.remove();
        });
        
        // Auto-run diagnostic
        setTimeout(() => {
            document.getElementById('run-emergency-check').click();
        }, 500);
    }
    
    /**
     * Display emergency results in panel
     */
    static displayEmergencyResults(results) {
        const container = document.getElementById('emergency-results');
        
        let html = '';
        
        if (results.healthy) {
            html = `
                <div style="color: #90EE90; font-weight: bold;">🎉 SYSTEM HEALTHY</div>
                <div>No critical issues detected.</div>
                <div>All systems functioning normally.</div>
            `;
        } else {
            html = `
                <div style="color: #FFB6C1; font-weight: bold;">⚠️ ${results.issueCount} ISSUES FOUND</div>
                <div style="margin: 10px 0;">
                    ${results.issues.map(issue => `<div>• ${issue}</div>`).join('')}
                </div>
            `;
            
            if (results.fixes.length > 0) {
                html += `
                    <div style="color: #87CEEB; font-weight: bold; margin-top: 15px;">💡 SUGGESTED FIXES:</div>
                    <div>
                        ${results.fixes.map(fix => `<div>• ${fix}</div>`).join('')}
                    </div>
                `;
            }
        }
        
        html += `<div style="margin-top: 15px; color: #D3D3D3; font-size: 10px;">Last check: ${new Date().toLocaleTimeString()}</div>`;
        
        container.innerHTML = html;
    }
}

// Keyboard shortcut to open emergency diagnostic (Ctrl+Shift+E)
if (typeof window !== 'undefined') {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            EmergencyDiagnostic.createEmergencyPanel();
        }
    });
    
    // Auto-create if there are console errors
    window.addEventListener('error', (e) => {
        console.error('💥 JavaScript Error Detected:', e.error);
        console.log('🚨 Press Ctrl+Shift+E to open Emergency Diagnostic');
    });
    
    // Make available globally
    window.EmergencyDiagnostic = EmergencyDiagnostic;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencyDiagnostic;
}