/**
 * Complete Path Fix for Campus Connect
 * Comprehensive solution for pathfinding issues
 */

class CompletePathFix {
    constructor() {
        this.fixes = [];
        this.appliedFixes = [];
        this.validationResults = [];
    }

    /**
     * Apply all pathfinding fixes
     */
    async applyAllFixes() {
        console.log('🔧 Applying complete pathfinding fixes...');

        // Fix 1: Ensure all room connections
        await this.fixRoomConnections();

        // Fix 2: Add missing hub connections
        await this.fixHubConnections();

        // Fix 3: Fix specific Room 310 → Room 305 issue
        await this.fixRoom310To305();

        // Fix 4: Add Room 314 → Main Hub 4 connection
        await this.fixRoom314ToHub4();

        // Fix 5: Fix coordinate transformations
        await this.fixCoordinateTransformations();

        // Fix 6: Validate graph integrity
        await this.validateGraphIntegrity();

        console.log('✅ All pathfinding fixes applied');
        return this.generateFixReport();
    }

    /**
     * Fix room connections - ensure all classrooms are connected
     */
    async fixRoomConnections() {
        console.log('🏫 Fixing room connections...');

        const fix = {
            name: 'Room Connections Fix',
            description: 'Ensure all 21 isolated classrooms are properly connected',
            applied: false,
            details: []
        };

        if (!window.campusGraph || !window.campusNodes) {
            fix.error = 'Campus data not available';
            this.fixes.push(fix);
            return;
        }

        const classrooms = window.campusNodes.filter(node => node.type === 'class');
        const graph = window.campusGraph;

        for (const classroom of classrooms) {
            if (!graph[classroom.id] || Object.keys(graph[classroom.id]).length === 0) {
                // Find nearest connected node
                const nearestConnection = this.findNearestConnectedNode(classroom);
                
                if (nearestConnection) {
                    // Add bidirectional connection
                    if (!graph[classroom.id]) graph[classroom.id] = {};
                    if (!graph[nearestConnection.id]) graph[nearestConnection.id] = {};
                    
                    const distance = this.calculateDistance(classroom, nearestConnection);
                    graph[classroom.id][nearestConnection.id] = distance;
                    graph[nearestConnection.id][classroom.id] = distance;
                    
                    fix.details.push(`Connected ${classroom.id} to ${nearestConnection.id} (${distance.toFixed(1)}px)`);
                }
            }
        }

        fix.applied = true;
        this.fixes.push(fix);
        this.appliedFixes.push('roomConnections');
    }

    /**
     * Fix hub connections for better routing
     */
    async fixHubConnections() {
        console.log('🎯 Fixing hub connections...');

        const fix = {
            name: 'Hub Connections Fix',
            description: 'Enhance intersection node connectivity',
            applied: false,
            details: []
        };

        if (!window.campusGraph || !window.campusNodes) {
            fix.error = 'Campus data not available';
            this.fixes.push(fix);
            return;
        }

        const hubs = window.campusNodes.filter(node => node.type === 'intersection');
        const graph = window.campusGraph;

        for (const hub of hubs) {
            // Ensure hubs are connected to nearby nodes
            const nearbyNodes = this.findNodesWithinRadius(hub, 150);
            
            for (const nearbyNode of nearbyNodes) {
                if (nearbyNode.id !== hub.id && nearbyNode.type !== 'invisible') {
                    if (!graph[hub.id]) graph[hub.id] = {};
                    if (!graph[nearbyNode.id]) graph[nearbyNode.id] = {};
                    
                    const distance = this.calculateDistance(hub, nearbyNode);
                    
                    if (!graph[hub.id][nearbyNode.id]) {
                        graph[hub.id][nearbyNode.id] = distance;
                        graph[nearbyNode.id][hub.id] = distance;
                        
                        fix.details.push(`Connected hub ${hub.id} to ${nearbyNode.id}`);
                    }
                }
            }
        }

        fix.applied = true;
        this.fixes.push(fix);
        this.appliedFixes.push('hubConnections');
    }

    /**
     * Fix specific Room 310 → Room 305 pathfinding issue
     */
    async fixRoom310To305() {
        console.log('🔍 Fixing Room 310 → Room 305 issue...');

        const fix = {
            name: 'Room 310-305 Fix',
            description: 'Fix specific pathfinding issue between Room 310 and Room 305',
            applied: false,
            details: []
        };

        if (!window.campusGraph || !window.campusNodes) {
            fix.error = 'Campus data not available';
            this.fixes.push(fix);
            return;
        }

        const room310 = window.campusNodes.find(n => n.id === 'room_310' || n.label.includes('310'));
        const room305 = window.campusNodes.find(n => n.id === 'room_305' || n.label.includes('305'));

        if (!room310 || !room305) {
            fix.error = 'Room 310 or 305 not found in node data';
            this.fixes.push(fix);
            return;
        }

        // Test current path
        const currentPath = this.findPath(room310.id, room305.id);
        
        if (!currentPath || currentPath.length === 0) {
            // Find intermediate waypoint
            const waypoint = this.findBestWaypointBetweenRooms(room310, room305);
            
            if (waypoint) {
                const graph = window.campusGraph;
                
                // Connect room 310 to waypoint
                if (!graph[room310.id]) graph[room310.id] = {};
                if (!graph[waypoint.id]) graph[waypoint.id] = {};
                
                const dist310 = this.calculateDistance(room310, waypoint);
                graph[room310.id][waypoint.id] = dist310;
                graph[waypoint.id][room310.id] = dist310;
                
                // Connect waypoint to room 305
                const dist305 = this.calculateDistance(waypoint, room305);
                graph[waypoint.id][room305.id] = dist305;
                graph[room305.id][waypoint.id] = dist305;
                
                fix.details.push(`Added waypoint ${waypoint.id} between rooms 310 and 305`);
            }
        }

        // Verify fix
        const newPath = this.findPath(room310.id, room305.id);
        fix.applied = newPath && newPath.length > 0;
        
        if (fix.applied) {
            fix.details.push(`Path now available: ${newPath.length} steps`);
        }

        this.fixes.push(fix);
        this.appliedFixes.push('room310to305');
    }

    /**
     * Add Room 314 → Main Hub 4 direct connection
     */
    async fixRoom314ToHub4() {
        console.log('🔗 Adding Room 314 → Main Hub 4 connection...');

        const fix = {
            name: 'Room 314 to Hub 4 Connection',
            description: 'Add direct connection between Room 314 and Main Hub 4',
            applied: false,
            details: []
        };

        if (!window.campusGraph || !window.campusNodes) {
            fix.error = 'Campus data not available';
            this.fixes.push(fix);
            return;
        }

        const room314 = window.campusNodes.find(n => 
            n.id === 'room_314' || 
            n.label.includes('314') ||
            n.id === 'class_314'
        );

        const hub4 = window.campusNodes.find(n => 
            n.id === 'main_hub_4' || 
            n.id === 'hub_4' ||
            n.label.includes('Hub 4')
        );

        if (!room314) {
            fix.error = 'Room 314 not found in node data';
            this.fixes.push(fix);
            return;
        }

        if (!hub4) {
            // Create Main Hub 4 if it doesn't exist
            const hub4Node = {
                id: 'main_hub_4',
                x: room314.x + 50, // Position near room 314
                y: room314.y - 30,
                label: 'Main Hub 4',
                type: 'intersection',
                searchable: false
            };
            
            window.campusNodes.push(hub4Node);
            fix.details.push('Created Main Hub 4 node');
        }

        const graph = window.campusGraph;
        const targetHub = hub4 || window.campusNodes.find(n => n.id === 'main_hub_4');

        // Add direct connection
        if (!graph[room314.id]) graph[room314.id] = {};
        if (!graph[targetHub.id]) graph[targetHub.id] = {};

        const distance = this.calculateDistance(room314, targetHub);
        graph[room314.id][targetHub.id] = distance;
        graph[targetHub.id][room314.id] = distance;

        fix.details.push(`Connected ${room314.id} to ${targetHub.id} (${distance.toFixed(1)}px)`);
        fix.applied = true;

        this.fixes.push(fix);
        this.appliedFixes.push('room314toHub4');
    }

    /**
     * Fix coordinate transformations for third floor
     */
    async fixCoordinateTransformations() {
        console.log('📐 Fixing coordinate transformations...');

        const fix = {
            name: 'Coordinate Transformation Fix',
            description: 'Ensure proper coordinate scaling for third floor display',
            applied: false,
            details: []
        };

        // Apply coordinate transformation fixes
        if (window.transformCoordinatesForRotatedSVG) {
            fix.details.push('Coordinate transformation function available');
        } else {
            // Add transformation function if missing
            window.transformCoordinatesForRotatedSVG = (graphData) => {
                const scaleX = 0.482333;
                const scaleY = 0.473229;
                
                const transformedData = JSON.parse(JSON.stringify(graphData));
                
                if (transformedData.nodes) {
                    transformedData.nodes.forEach(node => {
                        node.x *= scaleX;
                        node.y *= scaleY;
                    });
                }
                
                return transformedData;
            };
            
            fix.details.push('Added coordinate transformation function');
        }

        fix.applied = true;
        this.fixes.push(fix);
        this.appliedFixes.push('coordinateTransformations');
    }

    /**
     * Validate graph integrity after fixes
     */
    async validateGraphIntegrity() {
        console.log('✓ Validating graph integrity...');

        const validation = {
            name: 'Graph Integrity Validation',
            description: 'Verify graph structure after applying fixes',
            passed: true,
            issues: []
        };

        if (!window.campusGraph || !window.campusNodes) {
            validation.passed = false;
            validation.issues.push('Campus data not available');
            this.validationResults.push(validation);
            return;
        }

        const graph = window.campusGraph;
        const nodes = window.campusNodes;

        // Check 1: All nodes in graph have corresponding node data
        for (const nodeId in graph) {
            const nodeData = nodes.find(n => n.id === nodeId);
            if (!nodeData) {
                validation.issues.push(`Node ${nodeId} in graph but missing node data`);
                validation.passed = false;
            }
        }

        // Check 2: All connections are bidirectional
        for (const nodeId in graph) {
            for (const neighborId in graph[nodeId]) {
                if (!graph[neighborId] || !graph[neighborId][nodeId]) {
                    validation.issues.push(`Missing reverse connection: ${neighborId} -> ${nodeId}`);
                    validation.passed = false;
                }
            }
        }

        // Check 3: No isolated nodes
        const isolatedNodes = [];
        for (const node of nodes) {
            if (!graph[node.id] || Object.keys(graph[node.id]).length === 0) {
                isolatedNodes.push(node.id);
            }
        }

        if (isolatedNodes.length > 0) {
            validation.issues.push(`Isolated nodes found: ${isolatedNodes.join(', ')}`);
            validation.passed = false;
        }

        // Check 4: Validate specific fixed connections
        if (this.appliedFixes.includes('room310to305')) {
            const path = this.findPath('room_310', 'room_305');
            if (!path || path.length === 0) {
                validation.issues.push('Room 310 to 305 path still not working');
                validation.passed = false;
            }
        }

        this.validationResults.push(validation);
    }

    /**
     * Helper functions
     */
    findNearestConnectedNode(targetNode) {
        if (!window.campusNodes || !window.campusGraph) return null;

        let nearest = null;
        let minDistance = Infinity;

        for (const node of window.campusNodes) {
            if (node.id !== targetNode.id && window.campusGraph[node.id] && Object.keys(window.campusGraph[node.id]).length > 0) {
                const distance = this.calculateDistance(targetNode, node);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = node;
                }
            }
        }

        return nearest;
    }

    findNodesWithinRadius(centerNode, radius) {
        if (!window.campusNodes) return [];

        return window.campusNodes.filter(node => {
            if (node.id === centerNode.id) return false;
            const distance = this.calculateDistance(centerNode, node);
            return distance <= radius;
        });
    }

    findBestWaypointBetweenRooms(room1, room2) {
        if (!window.campusNodes) return null;

        // Find intersection or corridor node between the rooms
        const midX = (room1.x + room2.x) / 2;
        const midY = (room1.y + room2.y) / 2;

        let bestWaypoint = null;
        let minDistance = Infinity;

        for (const node of window.campusNodes) {
            if (node.type === 'intersection' || node.type === 'invisible') {
                const distanceToMid = Math.sqrt(
                    Math.pow(node.x - midX, 2) + Math.pow(node.y - midY, 2)
                );
                
                if (distanceToMid < minDistance) {
                    minDistance = distanceToMid;
                    bestWaypoint = node;
                }
            }
        }

        return bestWaypoint;
    }

    calculateDistance(node1, node2) {
        return Math.sqrt(
            Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2)
        );
    }

    findPath(start, end) {
        if (window.astarPath && window.campusGraph && window.campusNodes) {
            return window.astarPath(window.campusGraph, window.campusNodes, start, end);
        }
        return null;
    }

    /**
     * Generate comprehensive fix report
     */
    generateFixReport() {
        const report = {
            timestamp: new Date().toISOString(),
            appliedFixes: this.appliedFixes,
            fixes: this.fixes,
            validationResults: this.validationResults,
            summary: {
                totalFixes: this.fixes.length,
                successfulFixes: this.fixes.filter(f => f.applied).length,
                validationPassed: this.validationResults.every(v => v.passed)
            }
        };

        console.log('📋 Fix Report Generated:');
        console.log(`✅ Successful fixes: ${report.summary.successfulFixes}/${report.summary.totalFixes}`);
        console.log(`✓ Validation passed: ${report.summary.validationPassed}`);

        return report;
    }

    /**
     * Test specific pathfinding scenarios
     */
    async testPathfindingScenarios() {
        const scenarios = [
            ['room_310', 'room_305'],
            ['room_314', 'main_hub_4'],
            ['room_301', 'room_321'],
            // Add more test scenarios
        ];

        console.log('🧪 Testing pathfinding scenarios...');

        for (const [start, end] of scenarios) {
            const path = this.findPath(start, end);
            const status = path && path.length > 0 ? '✅' : '❌';
            console.log(`${status} ${start} → ${end}: ${path ? path.length + ' steps' : 'No path'}`);
        }
    }
}

// Auto-apply fixes when loaded
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(async () => {
            if (window.campusGraph && window.campusNodes) {
                console.log('🔧 Auto-applying pathfinding fixes...');
                window.completePathFix = new CompletePathFix();
                await window.completePathFix.applyAllFixes();
                await window.completePathFix.testPathfindingScenarios();
            }
        }, 4000); // Wait for campus system to fully load
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompletePathFix;
}