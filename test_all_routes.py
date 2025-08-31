#!/usr/bin/env python3
"""
Comprehensive routing test script - tests all classroom-to-classroom routing
"""

import json
import itertools
from collections import deque

def dijkstra(graph, start, end):
    """
    Simple Dijkstra implementation to test if a path exists between two nodes
    Returns (path_exists, path_length, path)
    """
    if start not in graph or end not in graph:
        return False, float('inf'), []
    
    if start == end:
        return True, 0, [start]
    
    # Initialize distances
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {}
    unvisited = set(graph.keys())
    
    while unvisited:
        # Find unvisited node with minimum distance
        current = min(unvisited, key=lambda x: distances[x])
        
        if distances[current] == float('inf'):
            break  # No path exists
            
        if current == end:
            # Reconstruct path
            path = []
            while current is not None:
                path.append(current)
                current = previous.get(current)
            path.reverse()
            return True, distances[end], path
        
        unvisited.remove(current)
        
        # Update distances to neighbors
        for neighbor, weight in graph[current].items():
            if neighbor in unvisited:
                alt = distances[current] + weight
                if alt < distances[neighbor]:
                    distances[neighbor] = alt
                    previous[neighbor] = current
    
    return False, float('inf'), []

def main():
    with open('pathfinding_graph_structural.json', 'r') as f:
        data = json.load(f)
    
    # Get all classroom nodes
    classroom_nodes = []
    for node in data['nodes']:
        if node['id'].startswith('class_') and node.get('searchable', False):
            classroom_nodes.append((node['id'], node['label']))
    
    classroom_nodes.sort()  # Sort for consistent testing
    graph = data['graph']
    
    print(f"🧪 COMPREHENSIVE ROUTING TEST")
    print(f"Testing {len(classroom_nodes)} classrooms")
    print(f"Total possible routes: {len(classroom_nodes) * (len(classroom_nodes) - 1)}")
    print("-" * 60)
    
    failed_routes = []
    successful_routes = 0
    total_routes = 0
    
    # Test all classroom-to-classroom combinations
    for i, (start_id, start_label) in enumerate(classroom_nodes):
        for j, (end_id, end_label) in enumerate(classroom_nodes):
            if i != j:  # Don't test same classroom to itself
                total_routes += 1
                path_exists, distance, path = dijkstra(graph, start_id, end_id)
                
                if path_exists:
                    successful_routes += 1
                    # Only print first few successful routes to avoid spam
                    if successful_routes <= 5:
                        print(f"✅ {start_label} → {end_label}: Distance {distance:.1f} ({len(path)-1} hops)")
                else:
                    failed_routes.append((start_id, start_label, end_id, end_label))
                    print(f"❌ {start_label} → {end_label}: NO ROUTE FOUND!")
    
    print("-" * 60)
    print(f"📊 RESULTS:")
    print(f"Total routes tested: {total_routes}")
    print(f"Successful routes: {successful_routes}")
    print(f"Failed routes: {len(failed_routes)}")
    print(f"Success rate: {(successful_routes/total_routes)*100:.1f}%")
    
    if failed_routes:
        print(f"\\n❌ FAILED ROUTES ({len(failed_routes)}):")
        for start_id, start_label, end_id, end_label in failed_routes:
            print(f"  • {start_label} ({start_id}) → {end_label} ({end_id})")
    else:
        print("\\n🎉 ALL ROUTES SUCCESSFUL! ✅")
    
    # Test some specific critical routes
    print(f"\\n🔍 CRITICAL ROUTE TESTS:")
    critical_tests = [
        ('class_1', 'class_21'),
        ('class_21', 'class_5'),
        ('class_5', 'class_21'),
        ('class_1', 'class_20'),
        ('class_10', 'class_15'),
        ('class_2', 'class_19')
    ]
    
    for start_id, end_id in critical_tests:
        path_exists, distance, path = dijkstra(graph, start_id, end_id)
        start_label = next(label for nid, label in classroom_nodes if nid == start_id)
        end_label = next(label for nid, label in classroom_nodes if nid == end_id)
        
        if path_exists:
            print(f"✅ {start_label} → {end_label}: {distance:.1f} units via {' → '.join(path)}")
        else:
            print(f"❌ {start_label} → {end_label}: FAILED")

if __name__ == '__main__':
    main()
