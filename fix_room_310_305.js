// Quick fix function to test Room 310 → 305 path
function testRoom310to305() {
    console.log('🧪 Testing Room 310 → Room 305 path...');
    
    // Make sure we're on third floor
    if (window.currentFloor !== 'third') {
        console.log('🔄 Switching to third floor...');
        document.getElementById('thirdFloorLink')?.click();
        setTimeout(() => {
            console.log('✅ Now on third floor, testing path...');
            testRoom310to305();
        }, 2000);
        return;
    }
    
    // Check if data is loaded
    if (!campusNodes || campusNodes.length === 0) {
        console.error('❌ Campus nodes not loaded. Wait for map to load and try again.');
        return;
    }
    
    // Find the rooms
    const room310 = campusNodes.find(n => n.id === 'class_310');
    const room305 = campusNodes.find(n => n.id === 'class_305');
    
    if (!room310 || !room305) {
        console.error('❌ Rooms not found:', { room310: !!room310, room305: !!room305 });
        return;
    }
    
    console.log('✅ Found rooms:', room310.label, 'and', room305.label);
    
    // Set as start and destination
    startNode = room310.id;
    destinationNode = room305.id;
    
    // Update the input fields
    document.getElementById('fromInput').value = room310.label;
    document.getElementById('toInput').value = room305.label;
    
    console.log('🔍 Set start:', startNode, 'destination:', destinationNode);
    
    // Test the path
    const path = astarPath(campusGraph, campusNodes, startNode, destinationNode);
    
    if (path && path.length > 0) {
        console.log('✅ PATH FOUND!');
        console.log('Route:', path.join(' → '));
        console.log('Steps:', path.length - 1);
        
        // Draw the path
        drawPath(path);
        currentPath = path;
        
        // Update status
        const status = document.getElementById('status');
        status.textContent = `Route: ${room310.label} → ${room305.label} (${path.length - 1} steps)`;
        
        // Close directions panel
        const panel = document.getElementById('directionsPanel');
        if (panel) panel.classList.remove('open');
        
        console.log('🎉 Path drawn successfully!');
    } else {
        console.error('❌ NO PATH FOUND!');
        console.log('Debug info:', {
            startInGraph: startNode in campusGraph,
            endInGraph: destinationNode in campusGraph,
            startConnections: campusGraph[startNode],
            endConnections: campusGraph[destinationNode]
        });
    }
}

// Add to window and run immediately if on third floor
window.testRoom310to305 = testRoom310to305;
console.log('🔧 Test function loaded. Run testRoom310to305() to test the path.');

// Auto-test if we're already on third floor with data loaded
if (window.currentFloor === 'third' && window.campusNodes && window.campusNodes.length > 0) {
    setTimeout(() => {
        console.log('🚀 Auto-testing Room 310 → 305 path...');
        testRoom310to305();
    }, 1000);
}
