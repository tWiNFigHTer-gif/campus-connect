// Test the exact user scenario in browser console
function debugRoomSearch() {
    console.log('🔍 Debugging Room 310 and 305 search...');
    console.log('Current floor:', window.currentFloor);
    console.log('Campus nodes loaded:', campusNodes?.length || 0);
    console.log('Campus graph loaded:', Object.keys(campusGraph || {}).length);
    
    if (!campusNodes || campusNodes.length === 0) {
        console.error('❌ Campus nodes not loaded!');
        return;
    }
    
    // Test searching for "310"
    console.log('\n🔍 Searching for "310":');
    const room310Results = campusNodes.filter(node => 
        node.searchable && 
        node.label && node.label.toLowerCase().includes('310')
    );
    console.log('Results:', room310Results.map(n => ({ id: n.id, label: n.label, searchable: n.searchable })));
    
    // Test searching for "305"
    console.log('\n🔍 Searching for "305":');
    const room305Results = campusNodes.filter(node => 
        node.searchable && 
        node.label && node.label.toLowerCase().includes('305')
    );
    console.log('Results:', room305Results.map(n => ({ id: n.id, label: n.label, searchable: n.searchable })));
    
    // Test the path between them
    if (room310Results.length > 0 && room305Results.length > 0) {
        const node310 = room310Results[0];
        const node305 = room305Results[0];
        
        console.log('\n🛤️ Testing path between rooms:');
        console.log('From:', node310.id, '(' + node310.label + ')');
        console.log('To:', node305.id, '(' + node305.label + ')');
        
        const path = astarPath(campusGraph, campusNodes, node310.id, node305.id);
        if (path && path.length > 1) {
            console.log('✅ PATH FOUND!');
            console.log('Route:', path.join(' → '));
            console.log('Steps:', path.length - 1);
        } else {
            console.log('❌ NO PATH FOUND!');
            
            // Debug why no path
            console.log('\nDebugging path failure:');
            console.log('Node 310 in graph:', node310.id in campusGraph);
            console.log('Node 305 in graph:', node305.id in campusGraph);
            console.log('Graph connections for 310:', campusGraph[node310.id]);
            console.log('Graph connections for 305:', campusGraph[node305.id]);
        }
    } else {
        console.log('\n❌ One or both rooms not found in search!');
        console.log('310 found:', room310Results.length > 0);
        console.log('305 found:', room305Results.length > 0);
    }
    
    // Test current global variables
    console.log('\n🔧 Current application state:');
    console.log('startNode:', window.startNode);
    console.log('destinationNode:', window.destinationNode);
    console.log('From input value:', document.getElementById('fromInput')?.value);
    console.log('To input value:', document.getElementById('toInput')?.value);
}

// Add to window for global access
window.debugRoomSearch = debugRoomSearch;
console.log('🔧 Debug function loaded. Run debugRoomSearch() in console to test.');
