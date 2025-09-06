// Manual path testing script
const ManualPathTester = require('./pathfinding_tester.js');

async function testSpecificPaths() {
    const tester = new ManualPathTester();
    
    try {
        console.log('🧪 Manual Path Testing\n');
        
        // Test Third Floor
        console.log('🏢 THIRD FLOOR TESTS:');
        console.log('='.repeat(30));
        await tester.loadFloorData('third');
        
        const thirdFloorTests = [
            { start: 'stairway_1', end: 'class_301', desc: 'Stairway A → Room 301' },
            { start: 'class_301', end: 'class_321', desc: 'Room 301 → Room 321' },
            { start: 'stairway_2', end: 'stairway_4', desc: 'Stairway B → Stairway D' },
            { start: 'class_312', end: 'class_316', desc: 'Room 312 → Room 316' },
            { start: 'stairway_3', end: 'class_319', desc: 'Stairway C → Room 319' }
        ];

        thirdFloorTests.forEach(test => {
            const path = tester.astarPath(test.start, test.end);
            const status = path && path.length > 1 ? '✅' : '❌';
            const pathLength = path ? path.length - 1 : 0;
            const distance = path ? tester.calculatePathDistance(path).toFixed(1) : 0;
            
            console.log(`${status} ${test.desc}:`);
            if (path) {
                console.log(`   Route: ${path.join(' → ')}`);
                console.log(`   Steps: ${pathLength} | Distance: ${distance} units\n`);
            } else {
                console.log(`   ❌ No path found\n`);
            }
        });

        // Test Second Floor
        console.log('🏢 SECOND FLOOR TESTS:');
        console.log('='.repeat(30));
        await tester.loadFloorData('second');
        
        const secondFloorTests = [
            { start: 'stairway_1', end: 'class_1', desc: 'Stairway 1 → Administration Block' },
            { start: 'class_2', end: 'class_5', desc: 'Health Centre → Classroom 5' },
            { start: 'stairway_2', end: 'stairway_3', desc: 'Stairway 2 → Stairway 3' }
        ];

        secondFloorTests.forEach(test => {
            const path = tester.astarPath(test.start, test.end);
            const status = path && path.length > 1 ? '✅' : '❌';
            const pathLength = path ? path.length - 1 : 0;
            const distance = path ? tester.calculatePathDistance(path).toFixed(1) : 0;
            
            console.log(`${status} ${test.desc}:`);
            if (path) {
                console.log(`   Route: ${path.join(' → ')}`);
                console.log(`   Steps: ${pathLength} | Distance: ${distance} units\n`);
            } else {
                console.log(`   ❌ No path found\n`);
            }
        });

        console.log('🎉 Manual testing completed!');
        
    } catch (error) {
        console.error(`❌ Manual testing failed: ${error.message}`);
    }
}

// Run if executed directly
if (require.main === module) {
    testSpecificPaths();
}

module.exports = testSpecificPaths;
