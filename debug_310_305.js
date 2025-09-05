// Test the specific problematic path: class_310 → class_305
const ManualPathTester = require('./pathfinding_tester.js');

async function testProblematicPath() {
    const tester = new ManualPathTester();
    
    console.log('🔍 Testing problematic path: Room 310 → Room 305');
    console.log('='.repeat(50));
    
    try {
        await tester.loadFloorData('third');
        
        // Check if both nodes exist
        const node310 = tester.campusNodes.find(n => n.id === 'class_310');
        const node305 = tester.campusNodes.find(n => n.id === 'class_305');
        
        console.log('📍 Node Information:');
        console.log(`  class_310: ${node310 ? '✅ Found' : '❌ Missing'} - ${node310?.label} at (${node310?.x}, ${node310?.y})`);
        console.log(`  class_305: ${node305 ? '✅ Found' : '❌ Missing'} - ${node305?.label} at (${node305?.x}, ${node305?.y})`);
        
        // Check graph connections
        console.log('\n🔗 Graph Connections:');
        console.log(`  class_310 connects to: ${Object.keys(tester.campusGraph['class_310'] || {}).join(', ')}`);
        console.log(`  class_305 connects to: ${Object.keys(tester.campusGraph['class_305'] || {}).join(', ')}`);
        
        // Test the path
        console.log('\n🛤️ Pathfinding Test:');
        const startTime = Date.now();
        const path = tester.astarPath('class_310', 'class_305');
        const endTime = Date.now();
        
        if (path && path.length > 1) {
            const distance = tester.calculatePathDistance(path).toFixed(1);
            console.log(`✅ PATH FOUND!`);
            console.log(`   Route: ${path.join(' → ')}`);
            console.log(`   Steps: ${path.length - 1}`);
            console.log(`   Distance: ${distance} units`);
            console.log(`   Time: ${endTime - startTime}ms`);
            
            // Verify each step in the path
            console.log('\n🔍 Path Verification:');
            for (let i = 0; i < path.length - 1; i++) {
                const current = path[i];
                const next = path[i + 1];
                const hasConnection = tester.campusGraph[current] && tester.campusGraph[current][next];
                const distance = hasConnection ? tester.campusGraph[current][next] : 'N/A';
                console.log(`   ${current} → ${next}: ${hasConnection ? '✅' : '❌'} (${distance})`);
            }
        } else {
            console.log(`❌ NO PATH FOUND`);
            console.log(`   Time: ${endTime - startTime}ms`);
            
            // Debug: Check connectivity
            console.log('\n🔍 Debug Information:');
            console.log('   Checking if nodes can reach intersections...');
            
            // Check class_310 connectivity
            const from310 = ['invisible_1', 'intersection_3', 'intersection_1'];
            from310.forEach(target => {
                const testPath = tester.astarPath('class_310', target);
                console.log(`   class_310 → ${target}: ${testPath ? '✅ Connected' : '❌ No path'}`);
            });
            
            // Check class_305 connectivity  
            const to305 = ['intersection_1', 'intersection_3', 'invisible_1'];
            to305.forEach(source => {
                const testPath = tester.astarPath(source, 'class_305');
                console.log(`   ${source} → class_305: ${testPath ? '✅ Connected' : '❌ No path'}`);
            });
        }
        
        // Test reverse path as well
        console.log('\n🔄 Testing Reverse Path (class_305 → class_310):');
        const reversePath = tester.astarPath('class_305', 'class_310');
        if (reversePath) {
            console.log(`✅ Reverse path: ${reversePath.join(' → ')}`);
        } else {
            console.log('❌ No reverse path found');
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

testProblematicPath();
