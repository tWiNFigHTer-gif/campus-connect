// Simple diagnostic for Room 310 → Room 305 issue
// Paste this in browser console when on the application

console.log('🔍 DIAGNOSTIC: Room 310 → Room 305');
console.log('='.repeat(40));

// Check current floor
console.log('Current Floor:', window.currentFloor || 'second');

// Check if nodes exist
const node310 = campusNodes.find(n => n.id === 'class_310');
const node305 = campusNodes.find(n => n.id === 'class_305');

console.log('Room 310 found:', node310 ? '✅' : '❌');
console.log('Room 305 found:', node305 ? '✅' : '❌');

if (node310 && node305) {
    console.log('Testing pathfinding...');
    const path = astarPath(campusGraph, campusNodes, 'class_310', 'class_305');
    console.log('Path found:', path ? '✅' : '❌');
    if (path) {
        console.log('Route:', path.join(' → '));
    }
} else {
    console.log('❌ Nodes not found - you need to be on THIRD FLOOR');
    console.log('Click "Third Floor" link to switch floors');
}
