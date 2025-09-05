// Simulate user search scenario
const ManualPathTester = require('./pathfinding_tester.js');

async function simulateUserSearch() {
    console.log('🎯 Simulating User Search Scenario');
    console.log('User searches for: "310" and "305"');
    console.log('='.repeat(50));
    
    const tester = new ManualPathTester();
    
    // Test both floors
    const floors = ['second', 'third'];
    
    for (const floor of floors) {
        console.log(`\n🏢 Testing ${floor.toUpperCase()} floor:`);
        console.log('-'.repeat(30));
        
        try {
            await tester.loadFloorData(floor);
            
            // Simulate user search for "310"
            const search310 = tester.campusNodes.filter(node => 
                node.searchable && 
                node.label && 
                node.label.toLowerCase().includes('310')
            );
            
            // Simulate user search for "305"
            const search305 = tester.campusNodes.filter(node => 
                node.searchable && 
                node.label && 
                node.label.toLowerCase().includes('305')
            );
            
            console.log(`🔍 Search for "310": ${search310.length} results`);
            search310.forEach((node, i) => {
                console.log(`   ${i+1}. ${node.label} (${node.id}) - Type: ${node.type}`);
            });
            
            console.log(`🔍 Search for "305": ${search305.length} results`);
            search305.forEach((node, i) => {
                console.log(`   ${i+1}. ${node.label} (${node.id}) - Type: ${node.type}`);
            });
            
            // Test pathfinding if both exist
            if (search310.length > 0 && search305.length > 0) {
                const node310 = search310[0];
                const node305 = search305[0];
                
                console.log(`\n🛤️ Testing path: ${node310.label} → ${node305.label}`);
                const path = tester.astarPath(node310.id, node305.id);
                
                if (path && path.length > 1) {
                    console.log(`✅ Path found: ${path.join(' → ')}`);
                    console.log(`   Distance: ${tester.calculatePathDistance(path).toFixed(1)} units`);
                } else {
                    console.log('❌ No path found');
                    
                    // Check individual connectivity
                    console.log('🔍 Connectivity check:');
                    console.log(`   ${node310.id} connections: ${Object.keys(tester.campusGraph[node310.id] || {}).length}`);
                    console.log(`   ${node305.id} connections: ${Object.keys(tester.campusGraph[node305.id] || {}).length}`);
                    console.log(`   ${node310.id} in graph: ${node310.id in tester.campusGraph}`);
                    console.log(`   ${node305.id} in graph: ${node305.id in tester.campusGraph}`);
                }
            } else {
                if (search310.length === 0 && search305.length === 0) {
                    console.log('❌ Neither 310 nor 305 found on this floor');
                } else if (search310.length === 0) {
                    console.log('❌ No room containing "310" found on this floor');
                } else if (search305.length === 0) {
                    console.log('❌ No room containing "305" found on this floor');
                }
            }
            
        } catch (error) {
            console.error(`❌ Error testing ${floor} floor: ${error.message}`);
        }
    }
    
    // Check if maybe the user has different room numbers in mind
    console.log('\n🤔 Alternative possibilities:');
    console.log('The user might be referring to:');
    console.log('- Room numbers without "Room" prefix');
    console.log('- Different floor (make sure third floor is selected)');
    console.log('- Typos in search terms');
    console.log('- Application not loading updated data');
    
    console.log('\n💡 Recommendations:');
    console.log('1. Ensure user is on THIRD floor (not second)');
    console.log('2. Search for "Room 310" or just "310"');
    console.log('3. Check browser console for errors');
    console.log('4. Refresh page to reload updated data');
}

simulateUserSearch();
