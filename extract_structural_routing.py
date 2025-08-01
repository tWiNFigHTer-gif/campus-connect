#!/usr/bin/env python3
"""
Creates navigation graph with strict structural enforcement.
Ensures all invisible/structural nodes are used in pathfinding.
"""
import json
import math
import re
import sys
import heapq
import xml.etree.ElementTree as ET

def create_nodes_from_coordinates():
    """
    Create nodes based on the official navigation specification with proper node types.
    """
    # Class Nodes (#6C1B1C) - Main searchable destinations
    class_nodes = [
        {'id': 'class_1', 'x': 2620.5, 'y': 4942.5, 'label': 'Classroom 1', 'type': 'class', 'searchable': True},
        {'id': 'class_2', 'x': 3377.5, 'y': 4862.0, 'label': 'Classroom 2', 'type': 'class', 'searchable': True},
        {'id': 'class_3', 'x': 3375.5, 'y': 4128.0, 'label': 'Classroom 3', 'type': 'class', 'searchable': True},
        {'id': 'class_4', 'x': 3356.5, 'y': 4045.0, 'label': 'Classroom 4', 'type': 'class', 'searchable': True},
        {'id': 'class_5', 'x': 2287.5, 'y': 3928.0, 'label': 'Classroom 5', 'type': 'class', 'searchable': True},
        {'id': 'class_6', 'x': 2211.5, 'y': 3999.0, 'label': 'Classroom 6', 'type': 'class', 'searchable': True},
        {'id': 'class_7', 'x': 2138.0, 'y': 4857.0, 'label': 'Classroom 7', 'type': 'class', 'searchable': True},
        {'id': 'class_8', 'x': 3602.5, 'y': 2628.0, 'label': 'Classroom 8', 'type': 'class', 'searchable': True},
        {'id': 'class_9', 'x': 5744.5, 'y': 1245.0, 'label': 'Classroom 9', 'type': 'class', 'searchable': True},
        {'id': 'class_10', 'x': 5744.5, 'y': 1359.0, 'label': 'Classroom 10', 'type': 'class', 'searchable': True},
        {'id': 'class_11', 'x': 5658.5, 'y': 1462.0, 'label': 'Classroom 11', 'type': 'class', 'searchable': True},
        {'id': 'class_12', 'x': 5658.5, 'y': 2469.0, 'label': 'Classroom 12', 'type': 'class', 'searchable': True},
        {'id': 'class_13', 'x': 5546.5, 'y': 2573.0, 'label': 'Classroom 13', 'type': 'class', 'searchable': True},
        {'id': 'class_14', 'x': 4991.5, 'y': 2573.0, 'label': 'Classroom 14', 'type': 'class', 'searchable': True},
        {'id': 'class_15', 'x': 3376.5, 'y': 4664.0, 'label': 'Classroom 15', 'type': 'class', 'searchable': True},
        {'id': 'class_16', 'x': 4547.5, 'y': 1689.0, 'label': 'Classroom 16', 'type': 'class', 'searchable': True},
        {'id': 'class_17', 'x': 4989.5, 'y': 1352.0, 'label': 'Classroom 17', 'type': 'class', 'searchable': True},
        {'id': 'class_18', 'x': 5550.5, 'y': 1352.0, 'label': 'Classroom 18', 'type': 'class', 'searchable': True},
        {'id': 'class_19', 'x': 5658.5, 'y': 2573.0, 'label': 'Classroom 19', 'type': 'class', 'searchable': True},
        {'id': 'class_20', 'x': 4552.5, 'y': 2240.0, 'label': 'Classroom 20', 'type': 'class', 'searchable': True},
    ]
    
    # Intersection Nodes (#3500C6) - Central navigation hubs
    intersection_nodes = [
        {'id': 'intersection_1', 'x': 2130.0, 'y': 4746.5, 'label': 'Main Hub 1', 'type': 'intersection', 'searchable': False},
        {'id': 'intersection_2', 'x': 5658.5, 'y': 1352.0, 'label': 'Main Hub 2', 'type': 'intersection', 'searchable': False},
        {'id': 'intersection_3', 'x': 4278.0, 'y': 1961.5, 'label': 'Main Hub 3', 'type': 'intersection', 'searchable': False},
        {'id': 'intersection_4', 'x': 2764.0, 'y': 3457.5, 'label': 'Main Hub 4', 'type': 'intersection', 'searchable': False},
    ]
    
    # Invisible Nodes (#33CA60) - Corridor waypoints for path geometry
    invisible_nodes = [
        {'id': 'invisible_1', 'x': 2905.1, 'y': 4944.5, 'label': 'Corridor Point 1', 'type': 'invisible', 'searchable': False},
        {'id': 'invisible_2', 'x': 2389.8, 'y': 4859.0, 'label': 'Corridor Point 2', 'type': 'invisible', 'searchable': False},
        {'id': 'invisible_3', 'x': 3129.0, 'y': 4858.5, 'label': 'Corridor Point 3', 'type': 'invisible', 'searchable': False},
        {'id': 'invisible_4', 'x': 4883.0, 'y': 2574.5, 'label': 'Corridor Point 4', 'type': 'invisible', 'searchable': False},
        {'id': 'invisible_5', 'x': 4897.0, 'y': 1353.5, 'label': 'Corridor Point 5', 'type': 'invisible', 'searchable': False},
        {'id': 'invisible_6', 'x': 2131.0, 'y': 4082.5, 'label': 'Corridor Point 6', 'type': 'invisible', 'searchable': False},
    ]
    
    # Stairway Nodes (#FFAE00) - Final destination stairways only
    stairway_nodes = [
        {'id': 'stairway_1', 'x': 5662.0, 'y': 1245.5, 'label': 'Stairway A', 'type': 'stairway', 'searchable': True},
        {'id': 'stairway_2', 'x': 1956.5, 'y': 4748.0, 'label': 'Stairway B', 'type': 'stairway', 'searchable': True},
        {'id': 'stairway_3', 'x': 4071.5, 'y': 2165.0, 'label': 'Stairway C', 'type': 'stairway', 'searchable': True},
        {'id': 'stairway_4', 'x': 2763.5, 'y': 3221.0, 'label': 'Stairway D', 'type': 'stairway', 'searchable': True},
    ]
    
    # Combine all nodes
    all_nodes = class_nodes + intersection_nodes + invisible_nodes + stairway_nodes
    
    # Add cluster_size for compatibility
    for node in all_nodes:
        node['cluster_size'] = 1
    
    print(f"INFO: Created navigation system with {len(class_nodes)} class nodes, {len(intersection_nodes)} intersection nodes, {len(invisible_nodes)} invisible nodes, and {len(stairway_nodes)} stairway nodes")
    return all_nodes

def extract_wall_segments(svg_file_path):
    """Extract all wall segments with stroke="#808080" from the SVG file."""
    wall_segments = []
    try:
        tree = ET.parse(svg_file_path)
        root = tree.getroot()
        namespaces = {'svg': 'http://www.w3.org/2000/svg'}
        
        for path in root.findall('.//svg:path[@stroke="#808080"]', namespaces):
            d_attr = path.get('d', '')
            
            if 'M' in d_attr and 'H' in d_attr:
                match = re.search(r'M\s*([0-9.]+)\s*([0-9.]+)\s*H\s*([0-9.]+)', d_attr)
                if match:
                    x1, y, x2 = float(match.group(1)), float(match.group(2)), float(match.group(3))
                    wall_segments.append([(x1, y), (x2, y)])
            elif 'M' in d_attr and 'V' in d_attr:
                match = re.search(r'M\s*([0-9.]+)\s*([0-9.]+)\s*V\s*([0-9.]+)', d_attr)
                if match:
                    x, y1, y2 = float(match.group(1)), float(match.group(2)), float(match.group(3))
                    wall_segments.append([(x, y1), (x, y2)])
            elif 'M' in d_attr and 'L' in d_attr:
                match = re.search(r'M\s*([0-9.]+)\s*([0-9.]+)\s*L\s*([0-9.]+)\s*([0-9.]+)', d_attr)
                if match:
                    x1, y1, x2, y2 = float(match.group(1)), float(match.group(2)), float(match.group(3)), float(match.group(4))
                    wall_segments.append([(x1, y1), (x2, y2)])
        
        print(f"INFO: Extracted {len(wall_segments)} wall segments from SVG")
        return wall_segments
    except Exception as e:
        print(f"ERROR: Failed to extract walls from SVG: {e}")
        return []

def line_intersects_segment(line_start, line_end, seg_start, seg_end):
    """Check if a line segment intersects with another line segment."""
    def ccw(A, B, C):
        return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])
    
    def intersect(A, B, C, D):
        return ccw(A, C, D) != ccw(B, C, D) and ccw(A, B, C) != ccw(A, B, D)
    
    return intersect(line_start, line_end, seg_start, seg_end)

def has_wall_obstruction(node1, node2, wall_segments):
    """Check if there's a wall between two nodes."""
    if not wall_segments:
        return False
    
    line_start = (node1['x'], node1['y'])
    line_end = (node2['x'], node2['y'])
    
    for wall_seg in wall_segments:
        if len(wall_seg) == 2:
            seg_start, seg_end = wall_seg
            if line_intersects_segment(line_start, line_end, seg_start, seg_end):
                return True
    return False

def create_structural_graph(nodes):
    """
    Creates a graph that ENFORCES structural routing through all nodes.
    No bypassing of invisible nodes or intermediate class nodes allowed.
    """
    print("INFO: Creating structural navigation graph...")
    
    wall_segments = extract_wall_segments('2nd-floor-map.svg')
    
    # Initialize graph
    graph = {node['id']: {} for node in nodes}
    
    # Define OPTIMAL structural paths based on building layout analysis
    # Focus on creating a robust backbone network with minimal but sufficient connections
    required_paths = [
        # === INTERSECTION BACKBONE NETWORK ===
        # Create a robust intersection network avoiding wall-blocked direct connections
        ('intersection_3', 'intersection_4'),  # Main Hub 3 ↔ Main Hub 4 (WORKS - key backbone)
        ('intersection_1', 'stairway_2'),      # Main Hub 1 → Stairway B
        ('intersection_2', 'stairway_1'),      # Main Hub 2 → Stairway A  
        ('intersection_3', 'stairway_3'),      # Main Hub 3 → Stairway C
        ('intersection_4', 'stairway_4'),      # Main Hub 4 → Stairway D
        
        # === INTER-CLUSTER BRIDGE CONNECTIONS ===
        # Use Class 8 as critical bridge between intersection areas  
        ('class_8', 'intersection_3'),         # Class 8 → Main Hub 3
        ('class_8', 'intersection_4'),         # Class 8 → Main Hub 4 (BRIDGE: lower↔upper areas)
        
        # Use strategic class nodes as bridges where intersection direct connections fail
        ('class_7', 'intersection_1'),         # Class 7 → Main Hub 1 (bridge to lower area)
        ('class_16', 'intersection_3'),        # Class 16 → Main Hub 3 (bridge: upper↔right areas)
        
        # === CLUSTER 1: LOWER LEFT AREA (Classes 1, 2, 7) ===
        # Lower left corridor system with proper structural routing
        ('class_1', 'invisible_1'),           # Class 1 → Corridor Point 1
        ('invisible_1', 'invisible_3'),       # Corridor Point 1 → Corridor Point 3
        ('invisible_3', 'class_2'),           # Corridor Point 3 → Class 2
        ('class_1', 'invisible_2'),           # Class 1 → Corridor Point 2
        ('class_7', 'invisible_2'),           # Class 7 → Corridor Point 2
        ('invisible_2', 'intersection_1'),    # Corridor Point 2 → Main Hub 1
        ('intersection_1', 'stairway_2'),     # Main Hub 1 → Stairway B
        
        # === CLUSTER 2: MIDDLE AREA (Classes 3, 4, 5, 6, 15) ===
        # Connect to Main Hub 4 as the central routing point for this cluster
        ('intersection_4', 'class_4'),        # Main Hub 4 → Class 4
        ('class_4', 'class_3'),               # Class 4 → Class 3 (MANDATORY sequence)
        ('class_3', 'class_15'),              # Class 3 → Class 15
        ('class_3', 'class_2'),               # Class 3 → Class 2 (ONLY route to Class 2 from this area)
        ('class_4', 'class_15'),              # Class 4 → Class 15 (direct route)
        # REMOVED: ('class_4', 'class_2') to force routing through Class 3
        ('class_4', 'invisible_3'),           # Class 4 → Corridor Point 3 (structural routing)
        ('class_6', 'intersection_4'),        # Class 6 → Main Hub 4
        ('class_6', 'invisible_6'),           # Class 6 → Corridor Point 6
        ('invisible_6', 'intersection_1'),    # Corridor Point 6 → Main Hub 1 (shorter route to lower area)
        ('invisible_6', 'class_7'),           # Corridor Point 6 → Class 7 (direct lower area access)
        ('class_5', 'class_6'),               # Class 5 → Class 6 (adjacent)
        ('class_5', 'intersection_4'),        # Class 5 → Main Hub 4
        ('intersection_4', 'stairway_4'),     # Main Hub 4 → Stairway D
        
        # === CLUSTER 3: MIDDLE RIGHT AREA (Class 8) ===
        # Class 8 as bridge between middle and upper areas
        ('class_8', 'intersection_3'),        # Class 8 → Main Hub 3
        ('class_8', 'intersection_4'),        # Class 8 → Main Hub 4 (bridge to middle area)
        ('class_8', 'class_3'),               # Class 8 → Class 3 (direct route to middle area)
        ('class_8', 'class_2'),               # Class 8 → Class 2 (direct route to lower area)
        ('class_8', 'invisible_3'),           # Class 8 → Corridor Point 3 (structural route to lower area)
        
        # === CLUSTER 4: UPPER AREA (Classes 9, 10, 11, 16, 17, 18) ===
        # Upper area centered around Main Hub 2
        ('class_16', 'invisible_5'),          # Class 16 → Corridor Point 5
        ('invisible_5', 'class_17'),          # Corridor Point 5 → Class 17
        ('invisible_5', 'class_18'),          # Corridor Point 5 → Class 18
        ('invisible_5', 'intersection_2'),    # Corridor Point 5 → Main Hub 2
        ('class_10', 'class_11'),             # Class 10 → Class 11 (adjacent)
        ('class_11', 'intersection_2'),       # Class 11 → Main Hub 2
        ('class_10', 'intersection_2'),       # Class 10 → Main Hub 2
        ('class_9', 'class_10'),              # Class 9 → Class 10 (adjacent)
        ('class_9', 'intersection_2'),        # Class 9 → Main Hub 2
        ('intersection_2', 'stairway_1'),     # Main Hub 2 → Stairway A
        
        # === CLUSTER 5: RIGHT SIDE AREA (Classes 12, 13, 14, 19, 20) ===
        # Right side centered around Main Hub 3 via Corridor Point 4
        ('class_13', 'invisible_4'),          # Class 13 → Corridor Point 4
        ('invisible_4', 'class_14'),          # Corridor Point 4 → Class 14
        ('invisible_4', 'class_19'),          # Corridor Point 4 → Class 19
        ('invisible_4', 'class_20'),          # Corridor Point 4 → Class 20
        ('invisible_4', 'intersection_3'),    # Corridor Point 4 → Main Hub 3
        ('class_12', 'class_19'),             # Class 12 → Class 19 (adjacent)
        ('class_20', 'intersection_3'),       # Class 20 → Main Hub 3
        ('class_16', 'class_20'),             # Class 16 → Class 20 (bridge between clusters)
        ('intersection_3', 'stairway_3'),     # Main Hub 3 → Stairway C
    ]
    
    connections_created = 0
    connections_blocked = 0
    
    # Create required connections
    for node1_id, node2_id in required_paths:
        node1 = next((n for n in nodes if n['id'] == node1_id), None)
        node2 = next((n for n in nodes if n['id'] == node2_id), None)
        
        if node1 and node2:
            distance = math.hypot(node1['x'] - node2['x'], node1['y'] - node2['y'])
            
            if not has_wall_obstruction(node1, node2, wall_segments):
                graph[node1_id][node2_id] = distance
                graph[node2_id][node1_id] = distance
                connections_created += 1
                print(f"  Required path: {node1_id} ↔ {node2_id} (distance: {distance:.1f})")
            else:
                connections_blocked += 1
                print(f"  BLOCKED by wall: {node1_id} ↔ {node2_id}")
    
    # Add short-range emergency connections for isolated nodes
    max_emergency_distance = 700.0
    for i, node1 in enumerate(nodes):
        if len(graph[node1['id']]) == 0:  # Isolated node
            for node2 in nodes[i+1:]:
                distance = math.hypot(node1['x'] - node2['x'], node1['y'] - node2['y'])
                
                if distance <= max_emergency_distance:
                    if not has_wall_obstruction(node1, node2, wall_segments):
                        graph[node1['id']][node2['id']] = distance
                        graph[node2['id']][node1['id']] = distance
                        connections_created += 1
                        print(f"  Emergency connection: {node1['id']} ↔ {node2['id']} (distance: {distance:.1f})")
    
    total_connections = sum(len(neighbors) for neighbors in graph.values())
    print(f"INFO: Structural graph created with {total_connections} directional connections")
    print(f"INFO: {connections_created} connections created, {connections_blocked} blocked by walls")
    
    return graph, nodes

def get_node_coordinates(nodes_list, node_id):
    """Helper function to get coordinates of a node by its ID."""
    for node in nodes_list:
        if node['id'] == node_id:
            return node['x'], node['y']
    return None, None

def heuristic_distance(node1_coords, node2_coords):
    """Calculate the Euclidean distance heuristic between two nodes."""
    x1, y1 = node1_coords
    x2, y2 = node2_coords
    return math.hypot(x2 - x1, y2 - y1)

def astar_shortest_path(graph, nodes_list, start_node, end_node):
    """A* algorithm to find the shortest path in a weighted graph."""
    import time
    start_time = time.time()
    nodes_explored = 0
    
    end_coords = get_node_coordinates(nodes_list, end_node)
    if end_coords[0] is None:
        print(f"ERROR: Could not find coordinates for end node: {end_node}")
        return None
    
    g_score = {node: float('inf') for node in graph}
    f_score = {node: float('inf') for node in graph}
    previous_nodes = {node: None for node in graph}
    
    g_score[start_node] = 0
    start_coords = get_node_coordinates(nodes_list, start_node)
    if start_coords[0] is None:
        print(f"ERROR: Could not find coordinates for start node: {start_node}")
        return None
    
    f_score[start_node] = heuristic_distance(start_coords, end_coords)
    
    open_set = [(f_score[start_node], start_node)]
    closed_set = set()

    while open_set:
        current_f, current_node = heapq.heappop(open_set)
        nodes_explored += 1
        
        if current_node in closed_set:
            continue
            
        closed_set.add(current_node)

        if current_node == end_node:
            break

        for neighbor, edge_weight in graph[current_node].items():
            if neighbor in closed_set:
                continue
                
            tentative_g = g_score[current_node] + edge_weight
            
            if tentative_g < g_score[neighbor]:
                previous_nodes[neighbor] = current_node
                g_score[neighbor] = tentative_g
                
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
    execution_time = (end_time - start_time) * 1000
    
    if path and path[0] == start_node:
        print(f"INFO: A* explored {nodes_explored} nodes in {execution_time:.2f}ms")
        return path
    else:
        return None

def main():
    """Main execution block."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  To extract and build graph: python structural_routing.py extract [output.json]")
        print("  To find a path: python structural_routing.py findpath <graph.json> <start_node_id> <end_node_id>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "extract":
        output_json = sys.argv[2] if len(sys.argv) > 2 else "pathfinding_graph.json"
        
        print("INFO: Creating structural navigation graph with enforced routing")
        nodes = create_nodes_from_coordinates()
        graph, enhanced_nodes = create_structural_graph(nodes)
        
        output_data = {'nodes': enhanced_nodes, 'graph': graph}
        with open(output_json, 'w') as f:
            json.dump(output_data, f, indent=2)
        print(f"✅ Structural graph data successfully saved to '{output_json}'")

    elif command == "findpath":
        if len(sys.argv) != 5:
            print("Usage: python structural_routing.py findpath <graph.json> <start_node_id> <end_node_id>")
            sys.exit(1)
        
        graph_file = sys.argv[2]
        start_id = sys.argv[3]
        end_id = sys.argv[4]
        
        try:
            with open(graph_file, 'r') as f:
                data = json.load(f)
            
            path = astar_shortest_path(data['graph'], data['nodes'], start_id, end_id)
            
            if path:
                print(f"✅ Shortest path found from {start_id} to {end_id} using A* algorithm:")
                print(" -> ".join(path))
            else:
                print(f"❌ No path found between {start_id} and {end_id}.")
        except FileNotFoundError:
            print(f"ERROR: Graph file not found at '{graph_file}'")

if __name__ == "__main__":
    main()
