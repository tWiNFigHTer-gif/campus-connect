#!/usr/bin/env python3
"""
Script to check connectivity of all nodes in the pathfinding graph
"""

import json
import math

def calculate_distance(node1, node2):
    """Calculate Euclidean distance between two nodes"""
    dx = node1['x'] - node2['x']
    dy = node1['y'] - node2['y']
    return math.sqrt(dx*dx + dy*dy)

def main():
    with open('pathfinding_graph_structural.json', 'r') as f:
        data = json.load(f)

    # Extract all node IDs and their data
    all_nodes = {}
    for node in data['nodes']:
        all_nodes[node['id']] = node

    # Get nodes that have edges
    connected_nodes = set(data['graph'].keys())

    # Find disconnected nodes
    disconnected = set(all_nodes.keys()) - connected_nodes

    print(f'📊 CONNECTIVITY ANALYSIS:')
    print(f'Total nodes: {len(all_nodes)}')
    print(f'Connected nodes: {len(connected_nodes)}')
    print(f'Disconnected nodes: {len(disconnected)}')
    print()

    if disconnected:
        print('❌ DISCONNECTED NODES:')
        intersections = []
        for node_id, node_data in all_nodes.items():
            if node_data['type'] == 'intersection':
                intersections.append((node_id, node_data))
        
        for node_id in sorted(disconnected):
            node_data = all_nodes[node_id]
            print(f'  - {node_id} ({node_data["label"]}) - Type: {node_data["type"]} - Coords: ({node_data["x"]}, {node_data["y"]})')
            
            # Find closest intersection
            if node_data['type'] != 'intersection':
                closest_intersection = None
                min_distance = float('inf')
                for int_id, int_data in intersections:
                    dist = calculate_distance(node_data, int_data)
                    if dist < min_distance:
                        min_distance = dist
                        closest_intersection = (int_id, int_data)
                
                if closest_intersection:
                    print(f'    → Closest intersection: {closest_intersection[0]} ({closest_intersection[1]["label"]}) - Distance: {min_distance:.2f}')
        print()
    else:
        print('✅ All nodes are connected!')

    # Check for searchable nodes that are disconnected
    searchable_disconnected = []
    for node_id in disconnected:
        if all_nodes[node_id].get('searchable', False):
            searchable_disconnected.append(node_id)
    
    if searchable_disconnected:
        print('🔍 CRITICAL: Searchable nodes that are disconnected:')
        for node_id in searchable_disconnected:
            node_data = all_nodes[node_id]
            print(f'  - {node_id} ({node_data["label"]})')
    
    # Test some sample routes
    print('\n🧪 TESTING SAMPLE ROUTES:')
    classroom_nodes = [node_id for node_id in all_nodes.keys() if node_id.startswith('class_') and all_nodes[node_id].get('searchable', False)]
    
    test_pairs = [
        ('class_1', 'class_5'),
        ('class_21', 'class_5'),
        ('class_10', 'class_15'),
        ('class_2', 'class_20')
    ]
    
    for start, end in test_pairs:
        if start in connected_nodes and end in connected_nodes:
            print(f'  ✅ {start} → {end}: Both nodes connected')
        elif start not in connected_nodes:
            print(f'  ❌ {start} → {end}: Start node disconnected')
        elif end not in connected_nodes:
            print(f'  ❌ {start} → {end}: End node disconnected')

if __name__ == '__main__':
    main()
