// Real-time pathfinding test function for browser console
function runPathfindingTests() {
    console.log('🧪 Running real-time pathfinding tests...');
    
    if (!campusNodes || !campusGraph || campusNodes.length === 0) {
        console.error('❌ Campus data not loaded. Please wait for the map to load.');
        return;
    }

    const results = {
        totalTests: 0,
        successful: 0,
        failed: 0,
        failedPaths: []
    };

    const testCases = [
        {
            name: 'Stairway Connectivity',
            nodes: campusNodes.filter(n => n.type === 'stairway'),
            expectedSuccess: 100
        },
        {
            name: 'Class Connectivity',
            nodes: campusNodes.filter(n => n.type === 'class').slice(0, 10),
            expectedSuccess: 95
        },
        {
            name: 'Mixed Node Types',
            nodes: [
                ...campusNodes.filter(n => n.type === 'stairway').slice(0, 2),
                ...campusNodes.filter(n => n.type === 'class').slice(0, 3),
                ...campusNodes.filter(n => n.type === 'intersection')
            ],
            expectedSuccess: 90
        }
    ];

    testCases.forEach(testCase => {
        console.log(`\n🔍 Testing ${testCase.name}:`);
        let caseSuccessful = 0;
        let caseTotal = 0;

        for (let i = 0; i < testCase.nodes.length; i++) {
            for (let j = i + 1; j < testCase.nodes.length; j++) {
                const startNode = testCase.nodes[i].id;
                const endNode = testCase.nodes[j].id;
                
                caseTotal++;
                results.totalTests++;

                const path = astarPath(campusGraph, campusNodes, startNode, endNode);
                
                if (path && path.length > 1) {
                    caseSuccessful++;
                    results.successful++;
                } else {
                    results.failed++;
                    results.failedPaths.push(`${startNode} → ${endNode}`);
                }
            }
        }

        const successRate = caseTotal > 0 ? ((caseSuccessful / caseTotal) * 100).toFixed(1) : 0;
        const status = successRate >= testCase.expectedSuccess ? '✅' : successRate >= 80 ? '⚠️' : '❌';
        
        console.log(`  ${status} Success Rate: ${successRate}% (${caseSuccessful}/${caseTotal})`);
    });

    // Overall results
    const overallSuccess = ((results.successful / results.totalTests) * 100).toFixed(1);
    console.log(`\n📊 Overall Results:`);
    console.log(`  Success Rate: ${overallSuccess}% (${results.successful}/${results.totalTests})`);
    console.log(`  Current Floor: ${window.currentFloor || 'second'}`);
    console.log(`  Nodes Available: ${campusNodes.length}`);
    console.log(`  Graph Connections: ${Object.keys(campusGraph).length}`);

    if (results.failedPaths.length > 0) {
        console.log(`\n❌ Failed Paths (${results.failedPaths.length}):`);
        results.failedPaths.slice(0, 10).forEach(path => console.log(`  ${path}`));
        if (results.failedPaths.length > 10) {
            console.log(`  ... and ${results.failedPaths.length - 10} more`);
        }
    }

    // Test specific critical paths
    console.log(`\n🔧 Testing Critical Paths:`);
    testCriticalPaths();

    return {
        overallSuccessRate: parseFloat(overallSuccess),
        totalTests: results.totalTests,
        successful: results.successful,
        failed: results.failed,
        isHealthy: overallSuccess >= 95
    };
}

function testCriticalPaths() {
    const stairways = campusNodes.filter(n => n.type === 'stairway');
    const classes = campusNodes.filter(n => n.type === 'class' && n.searchable);
    
    if (stairways.length >= 2 && classes.length >= 2) {
        // Test: All stairways connect to each other
        const stairwayPath = astarPath(campusGraph, campusNodes, stairways[0].id, stairways[1].id);
        console.log(`  Stairway-to-Stairway: ${stairwayPath ? '✅' : '❌'} (${stairways[0].label} → ${stairways[1].label})`);
        
        // Test: Stairways connect to classes
        const stairwayToClass = astarPath(campusGraph, campusNodes, stairways[0].id, classes[0].id);
        console.log(`  Stairway-to-Class: ${stairwayToClass ? '✅' : '❌'} (${stairways[0].label} → ${classes[0].label})`);
        
        // Test: Classes connect to each other
        const classToClass = astarPath(campusGraph, campusNodes, classes[0].id, classes[1].id);
        console.log(`  Class-to-Class: ${classToClass ? '✅' : '❌'} (${classes[0].label} → ${classes[1].label})`);
    }
}

// Add this function to window for global access
window.runPathfindingTests = runPathfindingTests;
console.log('🔧 Pathfinding test function loaded. Run runPathfindingTests() to test current floor.');
