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

def create_nodes_from_coordinates():
    """
    Create nodes from provided coordinates (fill #6C1B1C from example SVG)
    These coordinates are already in the correct SVG coordinate system (8830x6238)
    """
    predefined_nodes = [
        {'x': 4095.5, 'y': 2190, 'label': 'Node 1', 'type': 'unknown'},
        {'x': 2620.5, 'y': 4942.5, 'label': 'Node 2', 'type': 'unknown'},
        {'x': 3363, 'y': 4860, 'label': 'Node 3', 'type': 'unknown'},
        {'x': 3412, 'y': 4652.7, 'label': 'Node 4', 'type': 'unknown'},
        {'x': 3392.6, 'y': 4121, 'label': 'Node 5', 'type': 'unknown'},
        {'x': 3359.5, 'y': 4043, 'label': 'Node 6', 'type': 'unknown'},
        {'x': 2288.8, 'y': 3917, 'label': 'Node 7', 'type': 'unknown'},
        {'x': 2206, 'y': 3994, 'label': 'Node 8', 'type': 'unknown'},
        {'x': 2156.5, 'y': 4857, 'label': 'Node 9', 'type': 'unknown'},
        {'x': 2763.5, 'y': 3221, 'label': 'Node 10', 'type': 'unknown'},
        {'x': 3603.4, 'y': 2619.5, 'label': 'Node 11', 'type': 'unknown'},
        {'x': 4559.5, 'y': 1693, 'label': 'Node 12', 'type': 'unknown'},
        {'x': 5009.5, 'y': 1365, 'label': 'Node 13', 'type': 'unknown'},
        {'x': 5557.5, 'y': 1365, 'label': 'Node 14', 'type': 'unknown'},
        {'x': 5633.5, 'y': 1256, 'label': 'Node 15', 'type': 'unknown'},
        {'x': 5744, 'y': 1252, 'label': 'Node 16', 'type': 'unknown'},
        {'x': 5743, 'y': 1369.5, 'label': 'Node 17', 'type': 'unknown'},
        {'x': 5678, 'y': 1462.5, 'label': 'Node 18', 'type': 'unknown'},
        {'x': 5674.4, 'y': 2469.5, 'label': 'Node 19', 'type': 'unknown'},
        {'x': 5660.5, 'y': 2574, 'label': 'Node 20', 'type': 'unknown'},
        {'x': 5557.5, 'y': 2593, 'label': 'Node 21', 'type': 'unknown'},
        {'x': 4996.5, 'y': 2598.5, 'label': 'Node 22', 'type': 'unknown'},
        {'x': 4554.5, 'y': 2255, 'label': 'Node 23', 'type': 'unknown'},
    ]
    
    # Add IDs to the nodes
    for i, node in enumerate(predefined_nodes):
        node['id'] = f'node_{i}'
        node['cluster_size'] = 1
    
    print(f"INFO: Created {len(predefined_nodes)} nodes from provided coordinates")
    return predefined_nodes

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
    connection_radius = 2000.0  # Increased radius for better connectivity between all nodes

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
        # All corridor nodes removed - using only the 23 original nodes
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

def get_node_coordinates(nodes_list, node_id):
    """
    Helper function to get coordinates of a node by its ID.
    """
    for node in nodes_list:
        if node['id'] == node_id:
            return node['x'], node['y']
    return None, None

def heuristic_distance(node1_coords, node2_coords):
    """
    Calculate the Euclidean distance heuristic between two nodes.
    This is admissible (never overestimates) for pathfinding.
    """
    x1, y1 = node1_coords
    x2, y2 = node2_coords
    return math.hypot(x2 - x1, y2 - y1)

def astar_shortest_path(graph, nodes_list, start_node, end_node):
    """
    A* algorithm to find the shortest path in a weighted graph.
    More efficient than Dijkstra's as it uses a heuristic to guide the search.
    """
    import time
    start_time = time.time()
    nodes_explored = 0
    
    # Get coordinates for heuristic calculation
    end_coords = get_node_coordinates(nodes_list, end_node)
    if end_coords[0] is None:
        print(f"ERROR: Could not find coordinates for end node: {end_node}")
        return None
    
    # Initialize data structures
    g_score = {node: float('inf') for node in graph}  # Cost from start to node
    f_score = {node: float('inf') for node in graph}  # g_score + heuristic
    previous_nodes = {node: None for node in graph}
    
    g_score[start_node] = 0
    start_coords = get_node_coordinates(nodes_list, start_node)
    if start_coords[0] is None:
        print(f"ERROR: Could not find coordinates for start node: {start_node}")
        return None
    
    f_score[start_node] = heuristic_distance(start_coords, end_coords)
    
    # Priority queue stores tuples of (f_score, node_id)
    open_set = [(f_score[start_node], start_node)]
    closed_set = set()

    while open_set:
        current_f, current_node = heapq.heappop(open_set)
        nodes_explored += 1
        
        # Skip if we've already processed this node
        if current_node in closed_set:
            continue
            
        # Add to closed set
        closed_set.add(current_node)

        # Check if we've reached the goal
        if current_node == end_node:
            break

        # Explore neighbors
        for neighbor, edge_weight in graph[current_node].items():
            if neighbor in closed_set:
                continue
                
            # Calculate tentative g_score
            tentative_g = g_score[current_node] + edge_weight
            
            # If this path to neighbor is better than any previous one
            if tentative_g < g_score[neighbor]:
                previous_nodes[neighbor] = current_node
                g_score[neighbor] = tentative_g
                
                # Calculate heuristic for neighbor
                neighbor_coords = get_node_coordinates(nodes_list, neighbor)
                if neighbor_coords[0] is not None:
                    h_score = heuristic_distance(neighbor_coords, end_coords)
                    f_score[neighbor] = g_score[neighbor] + h_score
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))

    # Reconstruct path
    path = []
    current = end_node
    while current is not None:
        path.insert(0, current)
        current = previous_nodes[current]
    
    end_time = time.time()
    execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
    
    if path and path[0] == start_node:
        print(f"INFO: A* explored {nodes_explored} nodes in {execution_time:.2f}ms")
        return path
    else:
        return None  # No path found

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
        
        # Use predefined coordinates instead of extracting from SVG
        print("INFO: Using predefined node coordinates from example SVG")
        nodes = create_nodes_from_coordinates()
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
            
            path = astar_shortest_path(data['graph'], data['nodes'], start_id, end_id)
            
            if path:
                print(f"\n✅ Shortest path found from {start_id} to {end_id} using A* algorithm:")
                print(" -> ".join(path))
            else:
                print(f"\n❌ No path found between {start_id} and {end_id}.")
        except FileNotFoundError:
            print(f"ERROR: Graph file not found at '{graph_file}'")

if __name__ == "__main__":
    main()
