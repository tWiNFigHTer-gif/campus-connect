/**
 * Debug Tool for Room 310 to Room 305 Pathfinding Issue
 * Specific diagnostic tool for investigating and fixing this route
 */

class Debug310To305 {
    constructor() {
        this.diagnostics = [];
        this.fixes = [];
        this.testResults = [];
    }

    /**
     * Run comprehensive diagnosis of Room 310 to Room 305 issue
     */
    async runDiagnosis() {
        console.log('🔍 Debugging Room 310 → Room 305 pathfinding issue...');
        
        // Step 1: Verify nodes exist
        await this.verifyNodesExist();
        
        // Step 2: Check direct connections
        await this.checkDirectConnections();
        
        // Step 3: Find possible paths
        await this.findPossiblePaths();
        
        // Step 4: Analyze connectivity
        await this.analyzeConnectivity();
        
        // Step 5: Suggest fixes
        await this.suggestFixes();
        
        // Step 6: Apply and test fixes
        await this.applyAndTestFixes();
        
        return this.generateDiagnosisReport();
    }

    /**
     * Verify that both Room 310 and Room 305 exist in the node data
     */
    async verifyNodesExist() {
        console.log('📍 Verifying nodes exist...');
        
        const diagnosis = {
            step: 'Node Verification',
            checks: []
        };
        
        // Check for Room 310
        const room310Variants = ['room_310', 'class_310', '310'];
        let room310 = null;
        
        for (const variant of room310Variants) {
            room310 = window.campusNodes?.find(n => 
                n.id === variant || 
                n.label.includes('310') ||
                n.id.includes('310')
            );
            if (room310) break;
        }
        
        diagnosis.checks.push({
            name: 'Room 310 exists',
            passed: !!room310,
            details: room310 ? `Found as ${room310.id} at (${room310.x}, ${room310.y})` : 'Not found',
            data: room310
        });
        
        // Check for Room 305
        const room305Variants = ['room_305', 'class_305', '305'];
        let room305 = null;
        
        for (const variant of room305Variants) {
            room305 = window.campusNodes?.find(n => 
                n.id === variant || 
                n.label.includes('305') ||
                n.id.includes('305')
            );
            if (room305) break;
        }
        
        diagnosis.checks.push({
            name: 'Room 305 exists',
            passed: !!room305,
            details: room305 ? `Found as ${room305.id} at (${room305.x}, ${room305.y})` : 'Not found',
            data: room305
        });
        
        // Calculate distance if both exist
        if (room310 && room305) {
            const distance = Math.sqrt(
                Math.pow(room305.x - room310.x, 2) + Math.pow(room305.y - room310.y, 2)
            );
            
            diagnosis.checks.push({
                name: 'Distance between rooms',
                passed: true,
                details: `${distance.toFixed(1)} pixels`,
                distance: distance
            });
        }
        
        this.diagnostics.push(diagnosis);
        this.room310 = room310;
        this.room305 = room305;
    }

    /**
     * Check if there are direct connections between the rooms
     */
    async checkDirectConnections() {
        console.log('🔗 Checking direct connections...');
        
        if (!this.room310 || !this.room305) {
            this.diagnostics.push({
                step: 'Direct Connection Check',
                error: 'Cannot check connections - rooms not found'
            });
            return;
        }
        
        const diagnosis = {
            step: 'Direct Connection Check',
            checks: []
        };
        
        const graph = window.campusGraph;
        
        // Check Room 310 connections
        const room310Connections = graph[this.room310.id] || {};
        const room310ConnectedToRoom305 = !!room310Connections[this.room305.id];
        
        diagnosis.checks.push({
            name: 'Room 310 → Room 305 direct connection',
            passed: room310ConnectedToRoom305,
            details: room310ConnectedToRoom305 ? 
                `Connected with distance ${room310Connections[this.room305.id]}` : 
                'No direct connection'
        });
        
        // Check Room 305 connections
        const room305Connections = graph[this.room305.id] || {};
        const room305ConnectedToRoom310 = !!room305Connections[this.room310.id];
        
        diagnosis.checks.push({
            name: 'Room 305 → Room 310 direct connection',
            passed: room305ConnectedToRoom310,
            details: room305ConnectedToRoom310 ? 
                `Connected with distance ${room305Connections[this.room310.id]}` : 
                'No direct connection'
        });
        
        // List all connections for both rooms
        diagnosis.checks.push({
            name: 'Room 310 total connections',
            passed: Object.keys(room310Connections).length > 0,
            details: `Connected to: ${Object.keys(room310Connections).join(', ') || 'None'}`,
            connections: Object.keys(room310Connections)
        });
        
        diagnosis.checks.push({
            name: 'Room 305 total connections',
            passed: Object.keys(room305Connections).length > 0,
            details: `Connected to: ${Object.keys(room305Connections).join(', ') || 'None'}`,
            connections: Object.keys(room305Connections)
        });
        
        this.diagnostics.push(diagnosis);
    }

    /**
     * Find possible paths using A* algorithm
     */
    async findPossiblePaths() {
        console.log('🛤️ Finding possible paths...');
        
        if (!this.room310 || !this.room305) {
            this.diagnostics.push({
                step: 'Path Finding',
                error: 'Cannot find paths - rooms not found'
            });
            return;
        }
        
        const diagnosis = {
            step: 'Path Finding',
            checks: []
        };
        
        // Attempt pathfinding
        const startTime = performance.now();
        let path = null;
        let error = null;
        
        try {
            path = window.astarPath ? 
                window.astarPath(window.campusGraph, window.campusNodes, this.room310.id, this.room305.id) :
                null;
        } catch (e) {
            error = e.message;
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        diagnosis.checks.push({
            name: 'A* pathfinding result',
            passed: path && path.length > 0,
            details: path ? 
                `Path found with ${path.length} steps in ${duration.toFixed(2)}ms` : 
                `No path found (${error || 'unknown reason'})`,
            path: path,
            duration: duration,
            error: error
        });
        
        // Try reverse direction
        try {
            const reversePath = window.astarPath ? 
                window.astarPath(window.campusGraph, window.campusNodes, this.room305.id, this.room310.id) :
                null;
            
            diagnosis.checks.push({
                name: 'Reverse path (305 → 310)',
                passed: reversePath && reversePath.length > 0,
                details: reversePath ? 
                    `Reverse path found with ${reversePath.length} steps` : 
                    'No reverse path found',
                path: reversePath
            });
        } catch (e) {
            diagnosis.checks.push({
                name: 'Reverse path (305 → 310)',
                passed: false,
                details: `Error: ${e.message}`,
                error: e.message
            });
        }
        
        this.diagnostics.push(diagnosis);
        this.currentPath = path;
    }

    /**
     * Analyze connectivity to nearby nodes
     */
    async analyzeConnectivity() {
        console.log('🕸️ Analyzing connectivity...');
        
        if (!this.room310 || !this.room305) return;
        
        const diagnosis = {
            step: 'Connectivity Analysis',
            checks: []
        };
        
        // Find nodes near Room 310
        const nearRoom310 = this.findNearbyNodes(this.room310, 100);
        diagnosis.checks.push({
            name: 'Nodes near Room 310 (100px radius)',
            passed: nearRoom310.length > 0,
            details: `Found ${nearRoom310.length} nearby nodes`,
            nearbyNodes: nearRoom310.map(n => ({ id: n.id, type: n.type, distance: this.calculateDistance(this.room310, n).toFixed(1) }))
        });
        
        // Find nodes near Room 305
        const nearRoom305 = this.findNearbyNodes(this.room305, 100);
        diagnosis.checks.push({
            name: 'Nodes near Room 305 (100px radius)',
            passed: nearRoom305.length > 0,
            details: `Found ${nearRoom305.length} nearby nodes`,
            nearbyNodes: nearRoom305.map(n => ({ id: n.id, type: n.type, distance: this.calculateDistance(this.room305, n).toFixed(1) }))
        });
        
        // Find common nearby nodes (potential waypoints)
        const commonNearby = nearRoom310.filter(n310 => 
            nearRoom305.some(n305 => n305.id === n310.id)
        );
        
        diagnosis.checks.push({
            name: 'Common nearby nodes (potential waypoints)',
            passed: commonNearby.length > 0,
            details: `Found ${commonNearby.length} common nearby nodes`,
            waypoints: commonNearby.map(n => ({ 
                id: n.id, 
                type: n.type, 
                distTo310: this.calculateDistance(this.room310, n).toFixed(1),
                distTo305: this.calculateDistance(this.room305, n).toFixed(1)
            }))
        });
        
        this.diagnostics.push(diagnosis);
        this.potentialWaypoints = commonNearby;
    }

    /**
     * Suggest fixes for the pathfinding issue
     */
    async suggestFixes() {
        console.log('💡 Suggesting fixes...');
        
        const fixes = {
            step: 'Fix Suggestions',
            suggestions: []
        };
        
        if (!this.room310 || !this.room305) {
            fixes.suggestions.push({
                type: 'error',
                description: 'Cannot suggest fixes - rooms not found'
            });
            this.fixes.push(fixes);
            return;
        }
        
        // Fix 1: Direct connection
        const directDistance = this.calculateDistance(this.room310, this.room305);
        if (directDistance < 150) { // Close enough for direct connection
            fixes.suggestions.push({
                type: 'direct_connection',
                description: 'Add direct bidirectional connection between Room 310 and Room 305',
                details: `Distance: ${directDistance.toFixed(1)}px - suitable for direct connection`,
                priority: 'high',
                implementation: () => this.addDirectConnection()
            });
        }
        
        // Fix 2: Waypoint connection
        if (this.potentialWaypoints && this.potentialWaypoints.length > 0) {
            const bestWaypoint = this.potentialWaypoints[0]; // Closest to both
            fixes.suggestions.push({
                type: 'waypoint_connection',
                description: `Connect both rooms through waypoint: ${bestWaypoint.id}`,
                details: `Via ${bestWaypoint.type} node at optimal position`,
                priority: 'medium',
                waypoint: bestWaypoint,
                implementation: () => this.addWaypointConnection(bestWaypoint)
            });
        }
        
        // Fix 3: Add intermediate hub
        fixes.suggestions.push({
            type: 'intermediate_hub',
            description: 'Create intermediate hub node between the rooms',
            details: 'Add new intersection node for better connectivity',
            priority: 'low',
            implementation: () => this.addIntermediateHub()
        });
        
        // Fix 4: Enhance nearby connections
        fixes.suggestions.push({
            type: 'enhance_nearby',
            description: 'Enhance connections to nearby corridor/intersection nodes',
            details: 'Strengthen existing network connectivity',
            priority: 'medium',
            implementation: () => this.enhanceNearbyConnections()
        });
        
        this.fixes.push(fixes);
    }

    /**
     * Apply and test the suggested fixes
     */
    async applyAndTestFixes() {
        console.log('🔧 Applying and testing fixes...');
        
        if (!this.fixes.length) return;
        
        const fixResults = {
            step: 'Fix Application',
            results: []
        };
        
        const suggestions = this.fixes[this.fixes.length - 1].suggestions;
        
        for (const suggestion of suggestions) {
            if (suggestion.implementation) {
                try {
                    // Apply the fix
                    const fixResult = await suggestion.implementation();
                    
                    // Test if the fix worked
                    const testPath = window.astarPath ? 
                        window.astarPath(window.campusGraph, window.campusNodes, this.room310.id, this.room305.id) :
                        null;
                    
                    const success = testPath && testPath.length > 0;
                    
                    fixResults.results.push({
                        type: suggestion.type,
                        applied: true,
                        success: success,
                        details: success ? 
                            `Fix successful - path found with ${testPath.length} steps` :
                            'Fix applied but path still not found',
                        path: testPath
                    });
                    
                    if (success) {
                        console.log(`✅ Fix applied successfully: ${suggestion.description}`);
                        break; // Stop after first successful fix
                    }
                    
                } catch (error) {
                    fixResults.results.push({
                        type: suggestion.type,
                        applied: false,
                        success: false,
                        error: error.message,
                        details: `Failed to apply fix: ${error.message}`
                    });
                }
            }
        }
        
        this.diagnostics.push(fixResults);
    }

    /**
     * Fix implementations
     */
    async addDirectConnection() {
        if (!this.room310 || !this.room305 || !window.campusGraph) {
            throw new Error('Required data not available');
        }
        
        const distance = this.calculateDistance(this.room310, this.room305);
        const graph = window.campusGraph;
        
        // Add bidirectional connection
        if (!graph[this.room310.id]) graph[this.room310.id] = {};
        if (!graph[this.room305.id]) graph[this.room305.id] = {};
        
        graph[this.room310.id][this.room305.id] = distance;
        graph[this.room305.id][this.room310.id] = distance;
        
        return { type: 'direct', distance: distance };
    }

    async addWaypointConnection(waypoint) {
        if (!this.room310 || !this.room305 || !waypoint || !window.campusGraph) {
            throw new Error('Required data not available');
        }
        
        const graph = window.campusGraph;
        
        // Connect Room 310 to waypoint
        const dist310 = this.calculateDistance(this.room310, waypoint);
        if (!graph[this.room310.id]) graph[this.room310.id] = {};
        if (!graph[waypoint.id]) graph[waypoint.id] = {};
        graph[this.room310.id][waypoint.id] = dist310;
        graph[waypoint.id][this.room310.id] = dist310;
        
        // Connect waypoint to Room 305
        const dist305 = this.calculateDistance(waypoint, this.room305);
        if (!graph[this.room305.id]) graph[this.room305.id] = {};
        graph[waypoint.id][this.room305.id] = dist305;
        graph[this.room305.id][waypoint.id] = dist305;
        
        return { type: 'waypoint', waypoint: waypoint.id, distances: [dist310, dist305] };
    }

    async addIntermediateHub() {
        if (!this.room310 || !this.room305 || !window.campusNodes || !window.campusGraph) {
            throw new Error('Required data not available');
        }
        
        // Create intermediate hub node
        const midX = (this.room310.x + this.room305.x) / 2;
        const midY = (this.room310.y + this.room305.y) / 2;
        
        const hubNode = {
            id: 'hub_310_305',
            x: midX,
            y: midY,
            label: 'Hub 310-305',
            type: 'intersection',
            searchable: false
        };
        
        window.campusNodes.push(hubNode);
        
        // Connect both rooms to the hub
        const graph = window.campusGraph;
        graph[hubNode.id] = {};
        
        const dist310 = this.calculateDistance(this.room310, hubNode);
        const dist305 = this.calculateDistance(this.room305, hubNode);
        
        // Bidirectional connections
        if (!graph[this.room310.id]) graph[this.room310.id] = {};
        if (!graph[this.room305.id]) graph[this.room305.id] = {};
        
        graph[this.room310.id][hubNode.id] = dist310;
        graph[hubNode.id][this.room310.id] = dist310;
        graph[this.room305.id][hubNode.id] = dist305;
        graph[hubNode.id][this.room305.id] = dist305;
        
        return { type: 'hub', hubId: hubNode.id, position: { x: midX, y: midY } };
    }

    async enhanceNearbyConnections() {
        // Implementation for enhancing nearby connections
        return { type: 'enhanced_nearby', connections: 0 };
    }

    /**
     * Helper functions
     */
    findNearbyNodes(centerNode, radius) {
        if (!window.campusNodes) return [];
        
        return window.campusNodes.filter(node => {
            if (node.id === centerNode.id) return false;
            const distance = this.calculateDistance(centerNode, node);
            return distance <= radius;
        });
    }

    calculateDistance(node1, node2) {
        return Math.sqrt(
            Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
        );
    }

    /**
     * Generate comprehensive diagnosis report
     */
    generateDiagnosisReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                room310Found: !!this.room310,
                room305Found: !!this.room305,
                pathExists: !!this.currentPath,
                fixesApplied: this.diagnostics.filter(d => d.step === 'Fix Application').length > 0
            },
            diagnostics: this.diagnostics,
            recommendations: this.generateRecommendations()
        };
        
        console.log('📋 Room 310 → 305 Diagnosis Complete');
        console.log(`✅ Rooms found: 310=${!!this.room310}, 305=${!!this.room305}`);
        console.log(`🛤️ Path exists: ${!!this.currentPath}`);
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (!this.room310 || !this.room305) {
            recommendations.push('Verify that both Room 310 and Room 305 exist in the node data');
        }
        
        if (!this.currentPath) {
            recommendations.push('Apply direct connection fix or waypoint routing');
        }
        
        if (this.potentialWaypoints && this.potentialWaypoints.length > 0) {
            recommendations.push(`Consider using waypoint: ${this.potentialWaypoints[0].id}`);
        }
        
        return recommendations;
    }

    /**
     * Create debug interface
     */
    createDebugInterface() {
        const panel = document.createElement('div');
        panel.id = 'debug-310-305-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 10px;
            width: 350px;
            background: rgba(139, 0, 0, 0.9);
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
            <h3>🔍 Debug: Room 310 → 305</h3>
            <button id="run-310-305-diagnosis">Run Diagnosis</button>
            <button id="quick-fix-310-305">Quick Fix</button>
            <button id="test-path-310-305">Test Path</button>
            <div id="diagnosis-status">Ready</div>
            <div id="diagnosis-results"></div>
        `;
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('run-310-305-diagnosis').addEventListener('click', async () => {
            document.getElementById('diagnosis-status').textContent = 'Running diagnosis...';
            const report = await this.runDiagnosis();
            document.getElementById('diagnosis-status').textContent = 'Diagnosis complete';
            document.getElementById('diagnosis-results').innerHTML = this.formatReportForDisplay(report);
        });
        
        document.getElementById('quick-fix-310-305').addEventListener('click', async () => {
            try {
                await this.addDirectConnection();
                const path = window.astarPath(window.campusGraph, window.campusNodes, this.room310.id, this.room305.id);
                document.getElementById('diagnosis-status').textContent = 
                    path ? 'Quick fix applied - path found!' : 'Quick fix applied but path still missing';
            } catch (error) {
                document.getElementById('diagnosis-status').textContent = `Quick fix failed: ${error.message}`;
            }
        });
        
        document.getElementById('test-path-310-305').addEventListener('click', () => {
            const path = window.astarPath ? 
                window.astarPath(window.campusGraph, window.campusNodes, 'room_310', 'room_305') : null;
            document.getElementById('diagnosis-status').textContent = 
                path ? `Path exists: ${path.length} steps` : 'No path found';
        });
    }

    formatReportForDisplay(report) {
        return `
            <div>
                <strong>Summary:</strong><br>
                Room 310: ${report.summary.room310Found ? '✅' : '❌'}<br>
                Room 305: ${report.summary.room305Found ? '✅' : '❌'}<br>
                Path Exists: ${report.summary.pathExists ? '✅' : '❌'}<br>
                <br>
                <strong>Recommendations:</strong><br>
                ${report.recommendations.map(r => `• ${r}`).join('<br>')}
            </div>
        `;
    }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.campusNodes && window.campusGraph) {
                window.debug310To305 = new Debug310To305();
                window.debug310To305.createDebugInterface();
                console.log('🔍 Room 310 → 305 debugger loaded');
            }
        }, 3000);
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Debug310To305;
}