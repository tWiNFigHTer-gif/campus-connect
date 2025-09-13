#!/usr/bin/env python3
"""
Interactive Coordinate Query Demo
Allows users to interactively search for specific nodes and coordinates.
"""

from svg_coordinate_extractor import SVGCoordinateExtractor

def interactive_demo():
    """Run an interactive demonstration of the coordinate extractor."""
    
    print("🎯 INTERACTIVE SVG COORDINATE QUERY DEMO")
    print("=" * 50)
    
    extractor = SVGCoordinateExtractor("3rd floor swt (1).svg")
    coordinates = extractor.get_accurate_coordinates()
    
    print("Available commands:")
    print("  'lookup X Y' - Find node near coordinates X,Y")
    print("  'type NODE_TYPE' - Show all nodes of type (stairway/class/intersection/invisible)")
    print("  'count' - Show node counts by type")
    print("  'range' - Show coordinate ranges")
    print("  'help' - Show this help")
    print("  'quit' - Exit demo")
    print()
    
    while True:
        try:
            command = input("🔍 Query> ").strip().lower()
            
            if command == 'quit' or command == 'exit':
                print("👋 Demo complete!")
                break
                
            elif command == 'help':
                print("\nCommands:")
                print("  lookup 1630 2276 - Find node near (1630, 2276)")
                print("  type stairway - Show all stairway nodes")
                print("  count - Show node counts")
                print("  range - Show coordinate ranges")
                
            elif command == 'count':
                print("\n📊 Node Counts:")
                for color_code, coords in coordinates.items():
                    node_type = extractor.color_types[color_code]
                    print(f"  {node_type.capitalize():12s}: {len(coords):2d} nodes")
                    
            elif command == 'range':
                all_coords = [coord for coords_list in coordinates.values() for coord in coords_list]
                all_x = [x for x, y in all_coords]
                all_y = [x for x, y in all_coords]
                print(f"\n📐 Coordinate Ranges:")
                print(f"  X: {min(all_x):7.1f} to {max(all_x):7.1f}")
                print(f"  Y: {min(all_y):7.1f} to {max(all_y):7.1f}")
                
            elif command.startswith('lookup '):
                parts = command.split()
                if len(parts) == 3:
                    try:
                        x, y = float(parts[1]), float(parts[2])
                        result = extractor.get_node_by_coordinates(x, y, tolerance=5.0)
                        if result:
                            print(f"\n📍 Found: {result['type'].upper()} node")
                            print(f"   ID: {result['id']}")
                            print(f"   Coordinates: {result['coordinates']}")
                            print(f"   Color: {result['color']}")
                        else:
                            print(f"\n❌ No node found near ({x}, {y})")
                            print("   Try increasing search area or check coordinates")
                    except ValueError:
                        print("\n❌ Invalid coordinates. Use: lookup X Y (numbers)")
                else:
                    print("\n❌ Usage: lookup X Y")
                    
            elif command.startswith('type '):
                node_type = command.split()[1]
                found = False
                
                for color_code, coords in coordinates.items():
                    if extractor.color_types[color_code] == node_type:
                        print(f"\n🎯 {node_type.upper()} NODES ({color_code}):")
                        for i, (x, y) in enumerate(sorted(coords), 1):
                            print(f"  {i:2d}. ({x:7.1f}, {y:7.1f})")
                        found = True
                        break
                        
                if not found:
                    print(f"\n❌ Unknown node type: {node_type}")
                    print("   Available types: stairway, class, intersection, invisible")
                    
            else:
                print(f"\n❌ Unknown command: {command}")
                print("   Type 'help' for available commands")
                
        except KeyboardInterrupt:
            print("\n👋 Demo interrupted!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

def quick_examples():
    """Show some quick examples of what users can do."""
    
    print("\n💡 QUICK EXAMPLES:")
    print("-" * 30)
    print("Try these sample queries:")
    print("  lookup 1629.5 2276    # Find the class node")
    print("  lookup 3029.5 1319    # Find the intersection node") 
    print("  type stairway          # Show all stairway nodes")
    print("  type class             # Show all class nodes")
    print("  count                  # Show node statistics")
    print("  range                  # Show coordinate bounds")
    print()

def main():
    """Main function for the interactive demo."""
    quick_examples()
    interactive_demo()

if __name__ == "__main__":
    main()
