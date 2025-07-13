#!/usr/bin/env python3
"""
Extract red curve coordinates from SVG file for campus pathfinding
"""
import re
import json

def extract_red_curves(svg_file_path):
    """Extract all red curve paths from SVG"""
    red_curves = []
    
    with open(svg_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Find all paths with red stroke
    red_path_pattern = r'<path d="([^"]+)" stroke="#FF0000"[^>]*>'
    matches = re.findall(red_path_pattern, content)
    
    print(f"Found {len(matches)} red curve paths")
    
    for i, path_data in enumerate(matches):
        print(f"\nRed curve {i+1}: {path_data}")
        
        # Extract coordinates from path data
        coords = extract_coordinates_from_path(path_data)
        if coords:
            red_curves.append({
                'id': f'red_curve_{i+1}',
                'path_data': path_data,
                'coordinates': coords
            })
    
    return red_curves

def extract_coordinates_from_path(path_data):
    """Extract coordinate pairs from SVG path data"""
    coordinates = []
    
    # Pattern to match Move (M) and Line (L) commands with coordinates
    coord_pattern = r'[ML]\s*([0-9.]+)\s+([0-9.]+)'
    matches = re.findall(coord_pattern, path_data)
    
    for x, y in matches:
        coordinates.append({
            'x': float(x),
            'y': float(y)
        })
    
    # Also look for Horizontal (H) and Vertical (V) commands
    h_pattern = r'H\s*([0-9.]+)'
    v_pattern = r'V\s*([0-9.]+)'
    
    h_matches = re.findall(h_pattern, path_data)
    v_matches = re.findall(v_pattern, path_data)
    
    # For H and V commands, we need the previous coordinate
    # This is a simplified extraction - full SVG parsing would be more complex
    
    return coordinates

def generate_pathfinding_nodes(red_curves):
    """Generate pathfinding nodes from red curves"""
    nodes = []
    
    for curve in red_curves:
        if curve['coordinates']:
            # Use the first coordinate of each curve as a node
            coord = curve['coordinates'][0]
            
            # Create node
            node = {
                'id': curve['id'],
                'x': coord['x'],
                'y': coord['y'],
                'type': 'navigation_point',
                'label': f"Node {len(nodes) + 1}",
                'connections': []  # Will be populated later based on proximity
            }
            nodes.append(node)
    
    return nodes

def calculate_connections(nodes, max_distance=100):
    """Calculate connections between nodes based on distance"""
    for i, node in enumerate(nodes):
        for j, other_node in enumerate(nodes):
            if i != j:
                # Calculate distance
                dx = node['x'] - other_node['x']
                dy = node['y'] - other_node['y']
                distance = (dx*dx + dy*dy) ** 0.5
                
                if distance <= max_distance:
                    node['connections'].append({
                        'to': other_node['id'],
                        'distance': distance
                    })

def main():
    svg_file = 'z:/campus connect/3rd_floor.svg'
    
    # Extract red curves
    red_curves = extract_red_curves(svg_file)
    
    # Generate nodes
    nodes = generate_pathfinding_nodes(red_curves)
    
    # Calculate connections
    calculate_connections(nodes)
    
    # Save results
    results = {
        'red_curves': red_curves,
        'pathfinding_nodes': nodes
    }
    
    with open('z:/campus connect/red_curves_data.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nExtracted {len(red_curves)} red curves")
    print(f"Generated {len(nodes)} pathfinding nodes")
    print("Results saved to red_curves_data.json")
    
    # Print sample nodes for verification
    print("\nSample nodes:")
    for i, node in enumerate(nodes[:5]):
        print(f"  {node['id']}: ({node['x']}, {node['y']}) - {len(node['connections'])} connections")

if __name__ == "__main__":
    main()
