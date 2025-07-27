#!/usr/bin/env python3
"""
Extracts navigation nodes from an SVG floor plan, builds a weighted graph,
and finds the shortest path using Dijkstra's algorithm.
"""
import json
import math
import re
import sys
import heapq
import xml.etree.ElementTree as ET

def extract_red_curves_from_svg(svg_file_path):
    """
    Extracts all paths with a red stroke from an SVG file using an XML parser.
    """
    print(f"INFO: Parsing SVG file: {svg_file_path}")
    red_curves = []
    try:
        # Register the SVG namespace to properly find elements
        namespaces = {'svg': 'http://www.w3.org/2000/svg'}
        tree = ET.parse(svg_file_path)
        root = tree.getroot()

        # Find all path elements with a red stroke
        # Note: Stroke color can be in 'style' attribute or as a direct attribute.
        for i, path in enumerate(root.findall('.//svg:path', namespaces)):
            style = path.get('style', '')
            stroke = path.get('stroke', '')
            
            if 'stroke:#ff0000' in style.lower() or stroke.lower() == '#ff0000':
                path_data = path.get('d')
                if not path_data:
                    continue
                
                # Extract the first coordinate as the node's position
                coords_match = re.search(r'M\s*([0-9.]+)\s*,?\s*([0-9.]+)', path_data)
                if coords_match:
                    x = float(coords_match.group(1))
                    y = float(coords_match.group(2))
                    
                    red_curves.append({
                        'id': f'red_curve_{i+1}',
                        'coordinates': [{'x': x, 'y': y}],
                        # Placeholder for room_info; can be enhanced later
                        'room_info': {'room_type': 'unknown'}
                    })

        print(f"INFO: Found {len(red_curves)} red curve paths in the SVG.")
        return {'red_curves': red_curves}

    except FileNotFoundError:
        print(f"ERROR: SVG file not found at '{svg_file_path}'")
        return None
    except ET.ParseError:
        print(f"ERROR: Failed to parse the SVG file. It may be malformed.")
        return None

def process_and_consolidate_nodes(red_curves_data):
    """
    Consolidates very close nodes (like those at a doorway) into a single node.
    """
    raw_nodes = red_curves_data.get('red_curves', [])
    if not raw_nodes:
        return []

    print("INFO: Consolidating nearby nodes...")
    consolidated_nodes = []
    processed_indices = set()
    # *** MODIFIED: Increased radius to better consolidate node clusters. ***
    doorway_radius = 100.0

    for i, node1 in enumerate(raw_nodes):
        if i in processed_indices:
            continue

        cluster = [node1]
        processed_indices.add(i)

        for j, node2 in enumerate(raw_nodes):
            if j not in processed_indices:
                coord1 = node1['coordinates'][0]
                coord2 = node2['coordinates'][0]
                distance = math.hypot(coord1['x'] - coord2['x'], coord1['y'] - coord2['y'])
                
                if distance <= doorway_radius:
                    cluster.append(node2)
                    processed_indices.add(j)
        
        # Average the coordinates of the cluster to create a single central node
        avg_x = sum(n['coordinates'][0]['x'] for n in cluster) / len(cluster)
        avg_y = sum(n['coordinates'][0]['y'] for n in cluster) / len(cluster)
        
        consolidated_nodes.append({
            'id': f"node_{len(consolidated_nodes)}",
            'label': f"Point {len(consolidated_nodes)}", # Generic label
            'x': round(avg_x, 2),
            'y': round(avg_y, 2),
            'type': cluster[0]['room_info']['room_type'],
            'cluster_size': len(cluster)
        })
    
    print(f"INFO: Consolidated {len(raw_nodes)} raw points into {len(consolidated_nodes)} nodes.")
    return consolidated_nodes

def create_weighted_graph(nodes):
    """
    Creates a weighted graph where edge weights are the physical distances between nodes.
    Connects nodes based on a connection radius.
    """
    # First, add strategic intermediate nodes in corridors to improve connectivity
    enhanced_nodes = add_corridor_nodes(nodes)
    
    graph = {node['id']: {} for node in enhanced_nodes}
    connection_radius = 1400.0  # Balanced radius for neighboring connections with corridor nodes

    for i in range(len(enhanced_nodes)):
        for j in range(i + 1, len(enhanced_nodes)):
            node1 = enhanced_nodes[i]
            node2 = enhanced_nodes[j]
            distance = math.hypot(node1['x'] - node2['x'], node1['y'] - node2['y'])

            if distance <= connection_radius:
                # Add bidirectional weighted edge
                graph[node1['id']][node2['id']] = distance
                graph[node2['id']][node1['id']] = distance
    
    return graph, enhanced_nodes

def add_corridor_nodes(nodes):
    """
    Add strategic intermediate nodes in corridors and stairways to improve pathfinding connectivity.
    Also filters out nodes that appear to be outside the main floor plan layout.
    """
    print("INFO: Adding corridor and stairway nodes for better connectivity...")
    
    # Filter nodes to keep only those within the main building layout
    # Based on analysis, the main layout appears to be roughly between x: 2000-6000, y: 1200-5200
    filtered_nodes = []
    for node in nodes:
        x, y = node['x'], node['y']
        # Keep nodes within the main building area
        if 2000 <= x <= 6000 and 1200 <= y <= 5200:
            filtered_nodes.append(node)
        else:
            print(f"INFO: Filtered out node outside layout: {node['id']} at ({x:.0f}, {y:.0f})")
    
    print(f"INFO: Kept {len(filtered_nodes)} nodes within building layout (filtered {len(nodes) - len(filtered_nodes)})")
    enhanced_nodes = filtered_nodes.copy()
    corridor_nodes = []
    
    # Define strategic corridor positions based on the floor plan layout
    corridor_positions = [
        # Main horizontal corridor nodes
        {'x': 4000, 'y': 2000, 'label': 'Corridor A', 'type': 'corridor'},
        {'x': 4500, 'y': 2500, 'label': 'Corridor B', 'type': 'corridor'},
        {'x': 3500, 'y': 3000, 'label': 'Corridor C', 'type': 'corridor'},
        
        # Vertical corridor connectors
        {'x': 3000, 'y': 2500, 'label': 'Corridor D', 'type': 'corridor'},
        {'x': 5000, 'y': 2000, 'label': 'Corridor E', 'type': 'corridor'},
        
        # Strategic mid-building node (similar to str1mid.png pattern)
        {'x': 3800, 'y': 2800, 'label': 'Central Hub', 'type': 'junction'},
    ]
    
    # Use only corridor positions (removed stairway positions)
    all_special_positions = corridor_positions
    
    # Add nodes if they don't conflict with existing nodes
    for i, special in enumerate(all_special_positions):
        # Check if this position is too close to existing nodes
        too_close = False
        min_distance = 300  # Allow closer spacing for strategic nodes like Central Hub
        
        for existing_node in enhanced_nodes:
            distance = math.hypot(special['x'] - existing_node['x'], 
                                special['y'] - existing_node['y'])
            if distance < min_distance:
                too_close = True
                break
        
        if not too_close:
            node_type = special.get('type', 'corridor')
            existing_count = len([n for n in corridor_nodes if n['type'] == node_type])
            prefix = 'stair' if node_type == 'stairway' else 'corridor'
            
            special_node = {
                'id': f"{prefix}_{existing_count}",
                'label': special['label'],
                'x': special['x'],
                'y': special['y'],
                'type': node_type,
                'cluster_size': 1
            }
            corridor_nodes.append(special_node)
    
    enhanced_nodes.extend(corridor_nodes)
    
    # Count different types
    stairway_count = len([n for n in corridor_nodes if n['type'] == 'stairway'])
    corridor_count = len([n for n in corridor_nodes if n['type'] == 'corridor'])
    
    print(f"INFO: Added {corridor_count} corridor nodes and {stairway_count} stairway nodes")
    print(f"INFO: Total nodes: {len(enhanced_nodes)} (filtered original: {len(filtered_nodes)})")
    
    return enhanced_nodes

def dijkstra_shortest_path(graph, start_node, end_node):
    """
    Dijkstra's algorithm to find the shortest path in a weighted graph.
    """
    distances = {node: float('inf') for node in graph}
    distances[start_node] = 0
    previous_nodes = {node: None for node in graph}
    
    # Priority queue stores tuples of (distance, node_id)
    pq = [(0, start_node)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distances[current_node]:
            continue

        if current_node == end_node:
            break

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    # Reconstruct path
    path = []
    current = end_node
    while current is not None:
        path.insert(0, current)
        current = previous_nodes[current]
        
    if path and path[0] == start_node:
        return path
    else:
        return None # No path found

def main():
    """Main execution block."""
    if len(sys.argv) < 3:
        print("Usage:")
        print("  To extract and build graph: python your_script.py extract <input.svg> [output.json]")
        print("  To find a path: python your_script.py findpath <graph.json> <start_node_id> <end_node_id>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "extract":
        input_svg = sys.argv[2]
        output_json = sys.argv[3] if len(sys.argv) > 3 else "pathfinding_graph.json"
        
        red_curves_data = extract_red_curves_from_svg(input_svg)
        if not red_curves_data:
            sys.exit(1)
            
        nodes = process_and_consolidate_nodes(red_curves_data)
        graph, enhanced_nodes = create_weighted_graph(nodes)
        
        output_data = {'nodes': enhanced_nodes, 'graph': graph}
        with open(output_json, 'w') as f:
            json.dump(output_data, f, indent=2)
        print(f"\n✅ Graph data successfully saved to '{output_json}'")

    elif command == "findpath":
        if len(sys.argv) != 5:
            print("Usage: python your_script.py findpath <graph.json> <start_node_id> <end_node_id>")
            sys.exit(1)
        
        graph_file = sys.argv[2]
        start_id = sys.argv[3]
        end_id = sys.argv[4]
        
        try:
            with open(graph_file, 'r') as f:
                data = json.load(f)
            
            path = dijkstra_shortest_path(data['graph'], start_id, end_id)
            
            if path:
                print(f"\n✅ Shortest path found from {start_id} to {end_id}:")
                print(" -> ".join(path))
            else:
                print(f"\n❌ No path found between {start_id} and {end_id}.")
        except FileNotFoundError:
            print(f"ERROR: Graph file not found at '{graph_file}'")

if __name__ == "__main__":
    main()
