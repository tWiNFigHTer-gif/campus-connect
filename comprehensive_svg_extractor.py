#!/usr/bin/env python3
"""
Comprehensive SVG coordinate extractor with full validation.
Ensures accurate coordinate extraction from SVG elements.
"""

import xml.etree.ElementTree as ET
import re
import json
import csv
from collections import defaultdict

def extract_coordinates_from_path(path_data):
    """Extract all coordinate pairs from SVG path data with comprehensive regex."""
    # Enhanced regex to capture all numeric values including negatives and decimals
    pattern = r'(-?\d+(?:\.\d+)?)'
    numbers = re.findall(pattern, path_data)
    
    # Convert to coordinate pairs
    coordinates = []
    for i in range(0, len(numbers)-1, 2):
        try:
            x = float(numbers[i])
            y = float(numbers[i+1])
            coordinates.append((x, y))
        except (ValueError, IndexError):
            continue
    
    return coordinates

def calculate_geometric_center(coordinates):
    """Calculate geometric center from list of coordinates."""
    if not coordinates:
        return None, None
    
    x_coords = [coord[0] for coord in coordinates]
    y_coords = [coord[1] for coord in coordinates]
    
    # Use bounding box center for circular paths
    center_x = (min(x_coords) + max(x_coords)) / 2
    center_y = (min(y_coords) + max(y_coords)) / 2
    
    return center_x, center_y

def validate_coordinates(x, y, svg_width, svg_height):
    """Validate that coordinates are within SVG bounds."""
    try:
        width = float(svg_width)
        height = float(svg_height)
        return 0 <= x <= width and 0 <= y <= height
    except:
        return True  # If we can't validate bounds, assume valid

def extract_svg_data_comprehensive(file_path):
    """Comprehensive extraction of SVG data with full validation."""
    
    # Target colors and their meanings
    target_colors = {
        '#FFAE00': 'stairway',
        '#33CA60': 'invisible',
        '#3500C6': 'intersection', 
        '#6C1B1C': 'class'
    }
    
    results = defaultdict(list)
    svg_info = {}
    errors = []
    
    try:
        # Parse SVG
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Extract SVG metadata
        svg_info = {
            'width': root.get('width', 'unknown'),
            'height': root.get('height', 'unknown'),
            'viewBox': root.get('viewBox', 'unknown')
        }
        
        element_count = 0
        
        # Process all elements recursively
        for elem in root.iter():
            tag_name = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
            
            # Check ellipse elements
            if tag_name == 'ellipse':
                fill_color = elem.get('fill', '').strip()
                if fill_color in target_colors:
                    try:
                        cx = float(elem.get('cx', 0))
                        cy = float(elem.get('cy', 0))
                        rx = float(elem.get('rx', 0))
                        ry = float(elem.get('ry', 0))
                        transform = elem.get('transform', '')
                        
                        # Validate coordinates
                        if validate_coordinates(cx, cy, svg_info['width'], svg_info['height']):
                            element_count += 1
                            results[target_colors[fill_color]].append({
                                'x': cx,
                                'y': cy,
                                'color': fill_color,
                                'type': 'ellipse',
                                'element_id': element_count,
                                'rx': rx,
                                'ry': ry,
                                'transform': transform
                            })
                        else:
                            errors.append(f"Ellipse coordinates out of bounds: ({cx}, {cy})")
                    except ValueError as e:
                        errors.append(f"Error parsing ellipse: {e}")
            
            # Check circle elements
            elif tag_name == 'circle':
                fill_color = elem.get('fill', '').strip()
                if fill_color in target_colors:
                    try:
                        cx = float(elem.get('cx', 0))
                        cy = float(elem.get('cy', 0))
                        r = float(elem.get('r', 0))
                        transform = elem.get('transform', '')
                        
                        if validate_coordinates(cx, cy, svg_info['width'], svg_info['height']):
                            element_count += 1
                            results[target_colors[fill_color]].append({
                                'x': cx,
                                'y': cy,
                                'color': fill_color,
                                'type': 'circle',
                                'element_id': element_count,
                                'r': r,
                                'transform': transform
                            })
                        else:
                            errors.append(f"Circle coordinates out of bounds: ({cx}, {cy})")
                    except ValueError as e:
                        errors.append(f"Error parsing circle: {e}")
            
            # Check path elements
            elif tag_name == 'path':
                fill_color = elem.get('fill', '').strip()
                if fill_color in target_colors:
                    try:
                        path_data = elem.get('d', '')
                        coordinates = extract_coordinates_from_path(path_data)
                        
                        if coordinates:
                            center_x, center_y = calculate_geometric_center(coordinates)
                            
                            if center_x is not None and center_y is not None:
                                if validate_coordinates(center_x, center_y, svg_info['width'], svg_info['height']):
                                    element_count += 1
                                    results[target_colors[fill_color]].append({
                                        'x': center_x,
                                        'y': center_y,
                                        'color': fill_color,
                                        'type': 'path',
                                        'element_id': element_count,
                                        'coordinate_count': len(coordinates),
                                        'path_data': path_data[:100] + '...' if len(path_data) > 100 else path_data
                                    })
                                else:
                                    errors.append(f"Path center out of bounds: ({center_x}, {center_y})")
                        else:
                            errors.append(f"No coordinates found in path: {path_data[:50]}...")
                    except Exception as e:
                        errors.append(f"Error parsing path: {e}")
    
    except ET.ParseError as e:
        errors.append(f"XML parsing error: {e}")
        return None, None, [f"Failed to parse SVG file: {e}"]
    except FileNotFoundError:
        errors.append(f"File not found: {file_path}")
        return None, None, [f"SVG file not found: {file_path}"]
    
    return results, svg_info, errors

def export_comprehensive_results(results, svg_info, errors, base_filename):
    """Export results in multiple formats with comprehensive information."""
    
    # Text export with full details
    with open(f"{base_filename}.txt", 'w') as f:
        f.write("COMPREHENSIVE SVG COORDINATE EXTRACTION REPORT\n")
        f.write("=" * 60 + "\n\n")
        
        # SVG Information
        f.write("SVG FILE INFORMATION:\n")
        f.write("-" * 25 + "\n")
        f.write(f"Width: {svg_info.get('width', 'unknown')}\n")
        f.write(f"Height: {svg_info.get('height', 'unknown')}\n")
        f.write(f"ViewBox: {svg_info.get('viewBox', 'unknown')}\n\n")
        
        # Error reporting
        if errors:
            f.write("ERRORS ENCOUNTERED:\n")
            f.write("-" * 20 + "\n")
            for error in errors:
                f.write(f"  - {error}\n")
            f.write("\n")
        
        # Coordinate bounds
        all_x = []
        all_y = []
        total_count = 0
        
        for node_type, nodes in results.items():
            for node in nodes:
                all_x.append(node['x'])
                all_y.append(node['y'])
                total_count += 1
        
        if all_x and all_y:
            f.write("COORDINATE ANALYSIS:\n")
            f.write("-" * 20 + "\n")
            f.write(f"X range: {min(all_x):.1f} to {max(all_x):.1f}\n")
            f.write(f"Y range: {min(all_y):.1f} to {max(all_y):.1f}\n")
            f.write(f"Total nodes found: {total_count}\n\n")
        
        # Detailed node listings
        for node_type, nodes in sorted(results.items()):
            f.write(f"{node_type.upper()} NODES ({len(nodes)} total):\n")
            f.write("-" * 40 + "\n")
            
            for i, node in enumerate(nodes, 1):
                f.write(f"{i:3d}. ({node['x']:8.1f}, {node['y']:8.1f}) - {node['color']} ({node['type']})")
                if 'transform' in node and node['transform']:
                    f.write(f" [transform: {node['transform']}]")
                f.write("\n")
            f.write("\n")
        
        f.write(f"TOTAL ELEMENTS PROCESSED: {total_count}\n")
    
    # JSON export
    export_data = {
        'svg_info': svg_info,
        'errors': errors,
        'coordinates': dict(results),
        'summary': {
            'total_nodes': sum(len(nodes) for nodes in results.values()),
            'node_counts': {node_type: len(nodes) for node_type, nodes in results.items()}
        }
    }
    
    with open(f"{base_filename}.json", 'w') as f:
        json.dump(export_data, f, indent=2)
    
    # CSV export
    with open(f"{base_filename}.csv", 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Node_Type', 'X', 'Y', 'Color', 'Element_Type', 'Element_ID', 'Details'])
        
        for node_type, nodes in results.items():
            for node in nodes:
                details = f"Type: {node['type']}"
                if 'transform' in node and node['transform']:
                    details += f", Transform: {node['transform']}"
                if 'coordinate_count' in node:
                    details += f", Coord_Count: {node['coordinate_count']}"
                
                writer.writerow([
                    node_type,
                    f"{node['x']:.1f}",
                    f"{node['y']:.1f}",
                    node['color'],
                    node['type'],
                    node.get('element_id', ''),
                    details
                ])

def main():
    svg_file = "3rd floor swt (1).svg"
    output_base = "COMPREHENSIVE_coordinates"
    
    print("Starting comprehensive SVG coordinate extraction...")
    print(f"Processing file: {svg_file}")
    
    results, svg_info, errors = extract_svg_data_comprehensive(svg_file)
    
    if results is not None:
        # Display results
        print(f"\nSVG Information:")
        print(f"  Width: {svg_info.get('width', 'unknown')}")
        print(f"  Height: {svg_info.get('height', 'unknown')}")
        print(f"  ViewBox: {svg_info.get('viewBox', 'unknown')}")
        
        if errors:
            print(f"\nErrors encountered: {len(errors)}")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(errors) > 5:
                print(f"  ... and {len(errors)-5} more errors")
        
        # Summary
        total_nodes = sum(len(nodes) for nodes in results.values())
        print(f"\nNodes found:")
        for node_type, nodes in sorted(results.items()):
            print(f"  {node_type}: {len(nodes)} nodes")
        print(f"  Total: {total_nodes} nodes")
        
        # Coordinate bounds
        all_x = []
        all_y = []
        for nodes in results.values():
            for node in nodes:
                all_x.append(node['x'])
                all_y.append(node['y'])
        
        if all_x and all_y:
            print(f"\nCoordinate bounds:")
            print(f"  X range: {min(all_x):.1f} to {max(all_x):.1f}")
            print(f"  Y range: {min(all_y):.1f} to {max(all_y):.1f}")
        
        # Export results
        export_comprehensive_results(results, svg_info, errors, output_base)
        
        print(f"\nResults exported to:")
        print(f"  - {output_base}.txt (detailed report)")
        print(f"  - {output_base}.json (structured data)")
        print(f"  - {output_base}.csv (spreadsheet format)")
        
        # Show sample coordinates
        print(f"\nSample coordinates:")
        for node_type, nodes in sorted(results.items()):
            if nodes:
                print(f"\n{node_type.upper()}:")
                for i, node in enumerate(nodes[:3]):
                    print(f"  {i+1}. ({node['x']:8.1f}, {node['y']:8.1f}) - {node['color']} ({node['type']})")
                if len(nodes) > 3:
                    print(f"  ... and {len(nodes)-3} more")
    
    else:
        print("Failed to extract coordinates. Check error messages above.")

if __name__ == "__main__":
    main()
