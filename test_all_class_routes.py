import json
import heapq

def dijkstra(graph, start, end):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    previous = {}
    
    while pq:
        current_distance, current = heapq.heappop(pq)
        
        if current == end:
            path = []
            while current in previous:
                path.append(current)
                current = previous[current]
            path.append(start)
            return list(reversed(path)), distances[end]
        
        if current_distance > distances[current]:
            continue
        
        for neighbor, weight in graph.get(current, {}).items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(pq, (distance, neighbor))
    
    return None, float('infinity')

def main():
    with open('pathfinding_graph_structural.json', 'r') as f:
        data = json.load(f)

    # Get all class nodes
    class_nodes = [node for node in data['nodes'] if node['id'].startswith('class_')]
    print(f'Found {len(class_nodes)} class nodes')
    
    # List all class nodes
    print("\nClass nodes:")
    for node in class_nodes:
        connected = node['id'] in data['graph']
        connections = len(data['graph'].get(node['id'], {}))
        print(f"  {node['id']}: {node['label']} (connected: {connected}, {connections} connections)")
    
    print()

    # Test all class-to-class routes
    failed_routes = []
    successful_routes = []
    total_tests = 0

    for i, start_node in enumerate(class_nodes):
        for j, end_node in enumerate(class_nodes):
            if i != j:  # Don't test node to itself
                total_tests += 1
                path, distance = dijkstra(data['graph'], start_node['id'], end_node['id'])
                
                if path:
                    successful_routes.append((start_node['id'], end_node['id'], len(path)-1, round(distance, 2)))
                else:
                    failed_routes.append((start_node['id'], start_node['label'], end_node['id'], end_node['label']))

    print(f'ROUTE TEST RESULTS:')
    print(f'Total tests: {total_tests}')
    print(f'Successful routes: {len(successful_routes)}')
    print(f'Failed routes: {len(failed_routes)}')
    print()

    if failed_routes:
        print('❌ FAILED ROUTES:')
        for start_id, start_label, end_id, end_label in failed_routes:
            print(f'  {start_id} ({start_label}) -> {end_id} ({end_label})')
        
        # Check connectivity of problematic nodes
        print("\n🔍 ANALYZING CONNECTIVITY ISSUES:")
        problematic_nodes = set()
        for start_id, _, end_id, _ in failed_routes:
            problematic_nodes.add(start_id)
            problematic_nodes.add(end_id)
        
        for node_id in problematic_nodes:
            node = next((n for n in class_nodes if n['id'] == node_id), None)
            if node:
                connections = data['graph'].get(node_id, {})
                print(f"  {node_id} ({node['label']}): {len(connections)} connections -> {list(connections.keys())}")
    else:
        print('✅ ALL ROUTES WORKING!')
        
        # Show some sample successful routes
        print(f"\n📊 SAMPLE SUCCESSFUL ROUTES:")
        for i, (start, end, steps, distance) in enumerate(successful_routes[:5]):
            start_label = next(n['label'] for n in class_nodes if n['id'] == start)
            end_label = next(n['label'] for n in class_nodes if n['id'] == end)
            print(f"  {start} ({start_label}) -> {end} ({end_label}): {steps} steps, {distance} distance")

if __name__ == "__main__":
    main()
