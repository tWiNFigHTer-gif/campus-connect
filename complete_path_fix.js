// Complete fix for Room 310 and 305 pathfinding issue
function completePathFix() {
    console.log('🛠️ Complete Path Fix initiated...');
    
    // Step 1: Ensure we're on third floor
    if (window.currentFloor !== 'third') {
        console.log('🔄 Not on third floor, switching...');
        window.currentFloor = 'third';
        loadApplication(); // Reload with third floor data
        setTimeout(() => completePathFix(), 3000);
        return;
    }
    
    // Step 2: Verify data is loaded
    if (!campusNodes || campusNodes.length === 0 || !campusGraph) {
        console.log('⏳ Waiting for data to load...');
        setTimeout(() => completePathFix(), 1000);
        return;
    }
    
    console.log('✅ Data loaded:', campusNodes.length, 'nodes,', Object.keys(campusGraph).length, 'graph entries');
    
    // Step 3: Find the specific rooms
    const room310 = campusNodes.find(n => n.id === 'class_310' && n.label.includes('310'));
    const room305 = campusNodes.find(n => n.id === 'class_305' && n.label.includes('305'));
    
    if (!room310 || !room305) {
        console.error('❌ Rooms not found in data!');
        console.log('Available class nodes:', campusNodes.filter(n => n.type === 'class').map(n => ({ id: n.id, label: n.label })));
        return;
    }
    
    console.log('✅ Found rooms:', room310, room305);
    
    // Step 4: Verify they're in the graph
    if (!(room310.id in campusGraph) || !(room305.id in campusGraph)) {
        console.error('❌ Rooms not in graph!');
        console.log('310 in graph:', room310.id in campusGraph);
        console.log('305 in graph:', room305.id in campusGraph);
        return;
    }
    
    console.log('✅ Rooms verified in graph');
    
    // Step 5: Test pathfinding algorithm directly
    const testPath = astarPath(campusGraph, campusNodes, room310.id, room305.id);
    
    if (!testPath || testPath.length === 0) {
        console.error('❌ Algorithm failed to find path!');
        console.log('Graph connections for 310:', campusGraph[room310.id]);
        console.log('Graph connections for 305:', campusGraph[room305.id]);
        return;
    }
    
    console.log('✅ Algorithm found path:', testPath);
    
    // Step 6: Set up the UI properly
    startNode = room310.id;
    destinationNode = room305.id;
    
    // Clear existing paths
    clearPath();
    
    // Update input fields
    const fromInput = document.getElementById('fromInput');
    const toInput = document.getElementById('toInput');
    
    if (fromInput) fromInput.value = room310.label;
    if (toInput) toInput.value = room305.label;
    
    console.log('✅ UI updated with room selections');
    
    // Step 7: Draw the path
    try {
        drawPath(testPath);
        currentPath = testPath;
        
        // Update status
        const status = document.getElementById('status');
        if (status) {
            status.textContent = `Route: ${room310.label} → ${room305.label} (${testPath.length - 1} steps)`;
        }
        
        // Close directions panel
        const panel = document.getElementById('directionsPanel');
        if (panel) panel.classList.remove('open');
        
        console.log('🎉 SUCCESS! Path drawn on map');
        console.log('Route:', testPath.join(' → '));
        console.log('Distance:', testPath.length - 1, 'steps');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error drawing path:', error);
        return false;
    }
}

// Enhanced manual search function
function manualSearchAndPath(startRoom, endRoom) {
    console.log(`🔍 Manual search: ${startRoom} → ${endRoom}`);
    
    // Find rooms by label content
    const startNodes = campusNodes.filter(n => 
        n.searchable && n.label && n.label.toLowerCase().includes(startRoom.toLowerCase())
    );
    const endNodes = campusNodes.filter(n => 
        n.searchable && n.label && n.label.toLowerCase().includes(endRoom.toLowerCase())
    );
    
    console.log('Start matches:', startNodes.map(n => n.label));
    console.log('End matches:', endNodes.map(n => n.label));
    
    if (startNodes.length === 0 || endNodes.length === 0) {
        console.error('❌ Could not find rooms');
        return false;
    }
    
    const startNode = startNodes[0];
    const endNode = endNodes[0];
    
    // Set global variables
    window.startNode = startNode.id;
    window.destinationNode = endNode.id;
    
    // Test path
    const path = astarPath(campusGraph, campusNodes, startNode.id, endNode.id);
    
    if (path && path.length > 0) {
        console.log('✅ Found path:', path);
        drawPath(path);
        window.currentPath = path;
        
        const status = document.getElementById('status');
        if (status) {
            status.textContent = `Route: ${startNode.label} → ${endNode.label} (${path.length - 1} steps)`;
        }
        
        return true;
    } else {
        console.error('❌ No path found');
        return false;
    }
}

// Add functions to window
window.completePathFix = completePathFix;
window.manualSearchAndPath = manualSearchAndPath;

console.log('🛠️ Complete path fix loaded!');
console.log('Usage: completePathFix() or manualSearchAndPath("310", "305")');

// Auto-run if we're already set up
if (window.currentFloor === 'third' && window.campusNodes && window.campusNodes.length > 0) {
    setTimeout(() => {
        console.log('🚀 Auto-running complete path fix...');
        completePathFix();
    }, 500);
}
