#!/usr/bin/env python3
"""
Enhanced red curve extraction with room identification for campus pathfinding
"""
import re
import json
import math

def extract_red_curves_enhanced(svg_file_path):
    """Extract all red curve paths from SVG with enhanced room detection"""
    red_curves = []
    
    with open(svg_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Find all paths with red stroke
    red_path_pattern = r'<path d="([^"]+)" stroke="#FF0000"[^>]*>'
    matches = re.findall(red_path_pattern, content)
    
    print(f"Found {len(matches)} red curve paths")
    
    # Also extract room information from the SVG
    room_areas = extract_room_areas(content)
    
    for i, path_data in enumerate(matches):
        coords = extract_coordinates_from_path(path_data)
        if coords:
            # Identify the room/area for this curve
            room_info = identify_room_for_coordinates(coords[0], room_areas)
            
            red_curves.append({
                'id': f'red_curve_{i+1}',
                'path_data': path_data,
                'coordinates': coords,
                'room_info': room_info
            })
    
    return red_curves

def extract_room_areas(svg_content):
    """Extract colored room areas to help identify locations"""
    room_areas = []
    
    # Look for filled rectangles and paths that might represent rooms
    # Different colors might represent different room types
    room_colors = {
        '#FFD6D4': 'classroom',
        '#FAF8CB': 'office', 
        '#CFD7F4': 'lab',
        '#DEF0D3': 'facility',
        '#FFE5E5': 'common_area'
    }
    
    for color, room_type in room_colors.items():
        pattern = rf'<(?:rect|path)[^>]*fill="{re.escape(color)}"[^>]*>'
        matches = re.findall(pattern, svg_content)
        
        for match in matches:
            # Extract coordinates from the match
            coords = extract_area_coordinates(match)
            if coords:
                room_areas.append({
                    'type': room_type,
                    'color': color,
                    'bounds': coords
                })
    
    print(f"Found {len(room_areas)} room areas")
    return room_areas

def extract_area_coordinates(element_str):
    """Extract bounding coordinates from rect or path elements"""
    coords = {}
    
    # For rectangles
    x_match = re.search(r'x="([0-9.]+)"', element_str)
    y_match = re.search(r'y="([0-9.]+)"', element_str)
    width_match = re.search(r'width="([0-9.]+)"', element_str)
    height_match = re.search(r'height="([0-9.]+)"', element_str)
    
    if x_match and y_match and width_match and height_match:
        x = float(x_match.group(1))
        y = float(y_match.group(1))
        width = float(width_match.group(1))
        height = float(height_match.group(1))
        
        return {
            'x_min': x,
            'y_min': y,
            'x_max': x + width,
            'y_max': y + height,
            'center_x': x + width/2,
            'center_y': y + height/2
        }
    
    # For paths, extract min/max coordinates
    path_match = re.search(r'd="([^"]+)"', element_str)
    if path_match:
        path_data = path_match.group(1)
        coords_in_path = extract_coordinates_from_path(path_data)
        
        if coords_in_path:
            x_coords = [c['x'] for c in coords_in_path]
            y_coords = [c['y'] for c in coords_in_path]
            
            return {
                'x_min': min(x_coords),
                'y_min': min(y_coords),
                'x_max': max(x_coords),
                'y_max': max(y_coords),
                'center_x': sum(x_coords) / len(x_coords),
                'center_y': sum(y_coords) / len(y_coords)
            }
    
    return None

def identify_room_for_coordinates(coord, room_areas):
    """Identify which room a coordinate belongs to"""
    x, y = coord['x'], coord['y']
    
    # Find the closest room area
    closest_room = None
    min_distance = float('inf')
    
    for room in room_areas:
        bounds = room['bounds']
        
        # Check if point is inside the room
        if (bounds['x_min'] <= x <= bounds['x_max'] and 
            bounds['y_min'] <= y <= bounds['y_max']):
            return {
                'room_type': room['type'],
                'position': 'inside',
                'distance': 0
            }
        
        # Calculate distance to room center
        dx = x - bounds['center_x']
        dy = y - bounds['center_y']
        distance = math.sqrt(dx*dx + dy*dy)
        
        if distance < min_distance:
            min_distance = distance
            closest_room = room
    
    if closest_room:
        return {
            'room_type': closest_room['type'],
            'position': 'near',
            'distance': min_distance
        }
    
    return {
        'room_type': 'corridor',
        'position': 'unknown',
        'distance': 0
    }

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
    
    return coordinates

def generate_enhanced_pathfinding_nodes(red_curves):
    """Generate pathfinding nodes with enhanced labels"""
    nodes = []
    room_counters = {}
    
    for curve in red_curves:
        if curve['coordinates']:
            coord = curve['coordinates'][0]
            room_info = curve['room_info']
            
            # Generate meaningful label based on room info
            room_type = room_info['room_type']
            
            if room_type not in room_counters:
                room_counters[room_type] = 0
            room_counters[room_type] += 1
            
            # Create descriptive label
            if room_type == 'classroom':
                label = f"Classroom Area {room_counters[room_type]}"
            elif room_type == 'office':
                label = f"Office {room_counters[room_type]}"
            elif room_type == 'lab':
                label = f"Lab {room_counters[room_type]}"
            elif room_type == 'facility':
                label = f"Facility {room_counters[room_type]}"
            elif room_type == 'corridor':
                label = f"Corridor Point {room_counters[room_type]}"
            else:
                label = f"{room_type.title()} {room_counters[room_type]}"
            
            # Create node
            node = {
                'id': curve['id'],
                'x': coord['x'],
                'y': coord['y'],
                'type': room_type,
                'label': label,
                'room_info': room_info,
                'connections': []
            }
            nodes.append(node)
    
    return nodes

def calculate_enhanced_connections(nodes, max_distance=200):
    """Calculate connections with different max distances based on room types"""
    for i, node in enumerate(nodes):
        for j, other_node in enumerate(nodes):
            if i != j:
                # Calculate distance
                dx = node['x'] - other_node['x']
                dy = node['y'] - other_node['y']
                distance = math.sqrt(dx*dx + dy*dy)
                
                # Adjust max distance based on room types
                current_max = max_distance
                if node['type'] == 'corridor' or other_node['type'] == 'corridor':
                    current_max = max_distance * 1.5  # Corridors connect further
                elif node['type'] == other_node['type']:
                    current_max = max_distance * 0.8  # Same room type, closer connections
                
                if distance <= current_max:
                    node['connections'].append({
                        'to': other_node['id'],
                        'distance': distance,
                        'connection_type': get_connection_type(node, other_node)
                    })

def get_connection_type(node1, node2):
    """Determine the type of connection between two nodes"""
    if node1['type'] == node2['type']:
        return 'same_area'
    elif 'corridor' in [node1['type'], node2['type']]:
        return 'corridor_access'
    else:
        return 'inter_area'

def main():
    svg_file = 'z:/campus connect/3rd_floor.svg'
    
    # Extract red curves with enhanced room detection
    red_curves = extract_red_curves_enhanced(svg_file)
    
    # Generate enhanced nodes
    nodes = generate_enhanced_pathfinding_nodes(red_curves)
    
    # Calculate enhanced connections
    calculate_enhanced_connections(nodes)
    
    # Add key facility nodes based on common campus locations
    facility_nodes = [
        {'id': 'main_entrance', 'x': 1500, 'y': 2600, 'type': 'entrance', 'label': 'Main Entrance', 'connections': []},
        {'id': 'library', 'x': 1200, 'y': 2200, 'type': 'library', 'label': 'Library', 'connections': []},
        {'id': 'cafeteria', 'x': 900, 'y': 2400, 'type': 'cafeteria', 'label': 'Cafeteria', 'connections': []},
        {'id': 'admin_office', 'x': 2800, 'y': 1000, 'type': 'office', 'label': 'Administration', 'connections': []},
        {'id': 'computer_lab', 'x': 2900, 'y': 800, 'type': 'lab', 'label': 'Computer Lab', 'connections': []},
        {'id': 'restrooms', 'x': 1700, 'y': 1800, 'type': 'facility', 'label': 'Restrooms', 'connections': []}
    ]
    
    # Connect facility nodes to nearby navigation nodes
    for facility in facility_nodes:
        for node in nodes:
            dx = facility['x'] - node['x']
            dy = facility['y'] - node['y']
            distance = math.sqrt(dx*dx + dy*dy)
            
            if distance <= 300:  # Connect to nodes within 300 units
                facility['connections'].append({
                    'to': node['id'],
                    'distance': distance,
                    'connection_type': 'facility_access'
                })
                
                node['connections'].append({
                    'to': facility['id'],
                    'distance': distance,
                    'connection_type': 'facility_access'
                })
    
    nodes.extend(facility_nodes)
    
    # Generate statistics
    total_connections = sum(len(node['connections']) for node in nodes)
    room_type_counts = {}
    for node in nodes:
        room_type = node['type']
        room_type_counts[room_type] = room_type_counts.get(room_type, 0) + 1
    
    # Save results
    results = {
        'red_curves': red_curves,
        'pathfinding_nodes': nodes,
        'statistics': {
            'total_nodes': len(nodes),
            'total_connections': total_connections,
            'average_connections_per_node': total_connections / len(nodes) if nodes else 0,
            'room_type_distribution': room_type_counts
        }
    }
    
    with open('z:/campus connect/enhanced_red_curves_data.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nEnhanced extraction complete!")
    print(f"Total nodes: {len(nodes)}")
    print(f"Total connections: {total_connections}")
    print(f"Average connections per node: {total_connections / len(nodes):.1f}")
    print(f"\nRoom type distribution:")
    for room_type, count in room_type_counts.items():
        print(f"  {room_type}: {count}")
    
    print("Results saved to enhanced_red_curves_data.json")

if __name__ == "__main__":
    main()
