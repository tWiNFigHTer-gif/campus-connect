#!/usr/bin/env python3
import json
import os

# Load the third floor nodes JSON file
input_file = "data/third_floor_nodes.json"
output_file = "data/third_floor_nodes_rotated.json"

# Floor plan dimensions (from SVG)
FLOOR_WIDTH = 4259
FLOOR_HEIGHT = 2952

def rotate_180_degrees(x, y, width, height):
    """Rotate coordinates 180 degrees around the center of the floor plan"""
    new_x = width - x
    new_y = height - y
    return new_x, new_y

def main():
    # Read the current nodes file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Rotate all node coordinates
    rotated_nodes = []
    for node in data['nodes']:
        original_x = node['x']
        original_y = node['y']
        
        # Rotate the coordinates 180 degrees
        new_x, new_y = rotate_180_degrees(original_x, original_y, FLOOR_WIDTH, FLOOR_HEIGHT)
        
        # Create a new node with rotated coordinates
        rotated_node = node.copy()
        rotated_node['x'] = new_x
        rotated_node['y'] = new_y
        
        rotated_nodes.append(rotated_node)
        
        print(f"Node {node['id']}: ({original_x}, {original_y}) -> ({new_x}, {new_y})")
    
    # Create the rotated data structure
    rotated_data = {
        "nodes": rotated_nodes
    }
    
    # Save the rotated nodes to a new file first (backup)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(rotated_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nRotated nodes saved to: {output_file}")
    print(f"Total nodes rotated: {len(rotated_nodes)}")
    
    # Ask user confirmation before overwriting the original
    response = input(f"\nDo you want to update the original file ({input_file})? (y/N): ")
    if response.lower() == 'y':
        with open(input_file, 'w', encoding='utf-8') as f:
            json.dump(rotated_data, f, indent=2, ensure_ascii=False)
        print(f"Original file {input_file} has been updated with rotated coordinates!")
    else:
        print(f"Original file kept unchanged. Rotated version saved as {output_file}")

if __name__ == "__main__":
    main()
