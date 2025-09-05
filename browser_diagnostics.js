// Browser diagnostic script - paste this into the browser console
function diagnoseSearchIssue() {
    console.log('🔍 Diagnosing search issue for "310" and "305"');
    console.log('='.repeat(50));
    
    // Check if campus data is loaded
    if (!campusNodes || !campusGraph) {
        console.error('❌ Campus data not loaded. Please wait for the map to load.');
        return;
    }
    
    console.log(`📊 Campus data loaded: ${campusNodes.length} nodes, ${Object.keys(campusGraph).length} graph entries`);
    console.log(`🏢 Current floor: ${window.currentFloor || 'second'}`);
    
    // Search for nodes with "310" and "305"
    const search310 = campusNodes.filter(node => 
        node.label && node.label.toLowerCase().includes('310')
    );
    
    const search305 = campusNodes.filter(node => 
        node.label && node.label.toLowerCase().includes('305')
    );
    
    console.log('\n🔍 Search Results:');
    console.log('Nodes containing "310":');
    search310.forEach(node => {
        console.log(`  ✅ ID: ${node.id}, Label: "${node.label}", Searchable: ${node.searchable}, Type: ${node.type}`);
        console.log(`     Connections: ${node.id in campusGraph ? Object.keys(campusGraph[node.id]).length : 0}`);
    });
    
    console.log('\nNodes containing "305":');
    search305.forEach(node => {
        console.log(`  ✅ ID: ${node.id}, Label: "${node.label}", Searchable: ${node.searchable}, Type: ${node.type}`);
        console.log(`     Connections: ${node.id in campusGraph ? Object.keys(campusGraph[node.id]).length : 0}`);
    });
    
    // Test pathfinding between found nodes
    if (search310.length > 0 && search305.length > 0) {
        const node310 = search310[0];
        const node305 = search305[0];
        
        console.log('\n🛤️ Testing pathfinding:');
        console.log(`From: ${node310.id} (${node310.label})`);
        console.log(`To: ${node305.id} (${node305.label})`);
        
        // Test if astarPath function exists
        if (typeof astarPath === 'function') {
            const startTime = performance.now();
            const path = astarPath(campusGraph, campusNodes, node310.id, node305.id);
            const endTime = performance.now();
            
            if (path && path.length > 1) {
                console.log(`✅ PATH FOUND! (${(endTime - startTime).toFixed(2)}ms)`);
                console.log(`   Route: ${path.join(' → ')}`);
                console.log(`   Steps: ${path.length - 1}`);
            } else {
                console.log(`❌ NO PATH FOUND (${(endTime - startTime).toFixed(2)}ms)`);
                
                // Debug: check if nodes exist in graph
                console.log('🔍 Debug info:');
                console.log(`   ${node310.id} in graph: ${node310.id in campusGraph}`);
                console.log(`   ${node305.id} in graph: ${node305.id in campusGraph}`);
            }
        } else {
            console.log('❌ astarPath function not available');
        }
        
        // Test manual findPath function if it exists
        if (typeof findPath === 'function') {
            console.log('\n🧪 Testing with findPath function:');
            
            // Set global variables
            window.startNode = node310.id;
            window.destinationNode = node305.id;
            
            console.log(`Setting startNode = "${window.startNode}"`);
            console.log(`Setting destinationNode = "${window.destinationNode}"`);
            
            try {
                findPath();
                console.log('✅ findPath() executed successfully');
            } catch (error) {
                console.log(`❌ findPath() error: ${error.message}`);
            }
        }
    }
    
    // Check current global state
    console.log('\n📊 Current Global State:');
    console.log(`startNode: ${window.startNode || 'null'}`);
    console.log(`destinationNode: ${window.destinationNode || 'null'}`);
    console.log(`currentPath: ${window.currentPath ? window.currentPath.length + ' nodes' : 'null'}`);
}

// Make it globally available
window.diagnoseSearchIssue = diagnoseSearchIssue;
console.log('🔧 Diagnostic function loaded. Run diagnoseSearchIssue() in browser console.');
