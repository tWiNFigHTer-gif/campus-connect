#!/usr/bin/env python3
"""
SVG Color Node Finder
Extracts coordinates of circle/ellipse nodes with specific colors from an SVG file.

Target colors:
- #FFAE00: stairway nodes
- #33CA60: invisible nodes
- #3500C6: intersection nodes
- #6C1B1C: class nodes
"""

import xml.etree.ElementTree as ET
import re
import sys

def parse_svg_for_colored_nodes(svg_file_path):
    """Parse SVG file and extract coordinates of colored circle/ellipse nodes."""
    
    # Define target colors and their meanings
    color_types = {
        '#FFAE00': 'stairway nodes',
        '#33CA60': 'invisible nodes', 
        '#3500C6': 'intersection nodes',
        '#6C1B1C': 'class nodes'
    }
    
    # Store results by color
    results = {color: [] for color in color_types.keys()}
    
    try:
        # Parse the SVG file
        tree = ET.parse(svg_file_path)
        root = tree.getroot()
        
        # Find all ellipse and circle elements
        for elem in root.iter():
            if elem.tag.endswith('ellipse') or elem.tag.endswith('circle'):
                fill_color = elem.get('fill', '').upper()
                
                # Check if this element has one of our target colors
                for target_color in color_types.keys():
                    if fill_color == target_color.upper():
                        # Extract coordinates
                        if elem.tag.endswith('ellipse'):
                            cx = elem.get('cx')
                            cy = elem.get('cy')
                        elif elem.tag.endswith('circle'):
                            cx = elem.get('cx')
                            cy = elem.get('cy')
                        
                        if cx and cy:
                            results[target_color].append((float(cx), float(cy)))
            
            # Also check path elements that might represent circles
            elif elem.tag.endswith('path'):
                fill_color = elem.get('fill', '').upper()
                
                for target_color in color_types.keys():
                    if fill_color == target_color.upper():
                        # Try to extract center from circular path
                        d_attr = elem.get('d', '')
                        
                        # Extract all coordinate pairs from the path
                        coord_pattern = r'(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)'
                        coords = re.findall(coord_pattern, d_attr)
                        
                        if coords:
                            # Calculate center from bounding box of all coordinates
                            x_coords = [float(coord[0]) for coord in coords]
                            y_coords = [float(coord[1]) for coord in coords]
                            
                            if x_coords and y_coords:
                                cx = (min(x_coords) + max(x_coords)) / 2
                                cy = (min(y_coords) + max(y_coords)) / 2
                                results[target_color].append((cx, cy))
    
    except ET.ParseError as e:
        print(f"Error parsing SVG file: {e}")
        return None
    except FileNotFoundError:
        print(f"File not found: {svg_file_path}")
        return None
    
    return results, color_types

def print_results(results, color_types):
    """Print the results in the requested format."""
    
    print("SVG Circle Node Coordinates by Color:")
    print("=" * 50)
    
    for color, description in color_types.items():
        coordinates = results[color]
        print(f"\n{color}: {description}")
        
        if coordinates:
            for i, (x, y) in enumerate(coordinates, 1):
                print(f"  Node {i}: ({x}, {y})")
        else:
            print("  No nodes found")
        
        print(f"  Total count: {len(coordinates)}")

def main():
    svg_file = "3rd floor swt (1).svg"
    
    print("Analyzing SVG file for colored circle nodes...")
    print(f"File: {svg_file}")
    
    results, color_types = parse_svg_for_colored_nodes(svg_file)
    
    if results is not None:
        print_results(results, color_types)
        
        # Summary
        total_nodes = sum(len(coords) for coords in results.values())
        print(f"\n" + "=" * 50)
        print(f"SUMMARY: Found {total_nodes} colored circle nodes total")
        
        # Export to a simple text format
        with open("colored_nodes_coordinates.txt", "w") as f:
            f.write("SVG Circle Node Coordinates by Color\n")
            f.write("=" * 50 + "\n")
            
            for color, description in color_types.items():
                coordinates = results[color]
                f.write(f"\n{color}: {description}\n")
                
                if coordinates:
                    for i, (x, y) in enumerate(coordinates, 1):
                        f.write(f"  Node {i}: ({x}, {y})\n")
                else:
                    f.write("  No nodes found\n")
                
                f.write(f"  Total count: {len(coordinates)}\n")
        
        print(f"Results exported to: colored_nodes_coordinates.txt")
    
    else:
        print("Failed to parse SVG file.")

if __name__ == "__main__":
    main()
