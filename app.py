#!/usr/bin/env python3
"""
Flask web server for Campus Connect application.
Serves static files and provides pathfinding API endpoints.
"""

import os
import json
import logging
from flask import Flask, send_from_directory, jsonify, request, send_file
from flask_cors import CORS
from extract_structural_routing import create_nodes_from_coordinates, create_structural_graph, astar_shortest_path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to store graph data
graph_data = None

def load_graph_data():
    """Load or generate graph data."""
    global graph_data
    
    json_file = 'pathfinding_graph_structural.json'
    
    try:
        # Try to load existing graph data
        with open(json_file, 'r') as f:
            graph_data = json.load(f)
        logger.info(f"Loaded existing graph data from {json_file}")
    except FileNotFoundError:
        # Generate new graph data
        logger.info("Generating new graph data...")
        nodes = create_nodes_from_coordinates()
        graph, enhanced_nodes = create_structural_graph(nodes)
        
        graph_data = {'nodes': enhanced_nodes, 'graph': graph}
        
        # Save the generated data
        with open(json_file, 'w') as f:
            json.dump(graph_data, f, indent=2)
        logger.info(f"Generated and saved graph data to {json_file}")

@app.route('/')
def index():
    """Serve the main application."""
    return send_file('campus-connect-final.html')

@app.route('/simple')
def simple():
    """Serve the simple version of the application."""
    return send_file('campus-connect-simple.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory('.', filename)

@app.route('/api/graph')
def get_graph():
    """Get the navigation graph data."""
    if graph_data is None:
        load_graph_data()
    return jsonify(graph_data)

@app.route('/api/path')
def find_path():
    """Find a path between two nodes."""
    start_id = request.args.get('start')
    end_id = request.args.get('end')
    
    if not start_id or not end_id:
        return jsonify({'error': 'Both start and end node IDs are required'}), 400
    
    if graph_data is None:
        load_graph_data()
    
    try:
        path = astar_shortest_path(graph_data['graph'], graph_data['nodes'], start_id, end_id)
        
        if path:
            # Get node details for the path
            path_details = []
            for node_id in path:
                node = next((n for n in graph_data['nodes'] if n['id'] == node_id), None)
                if node:
                    path_details.append({
                        'id': node_id,
                        'label': node.get('label', node_id),
                        'x': node['x'],
                        'y': node['y'],
                        'type': node.get('type', 'unknown')
                    })
            
            return jsonify({
                'success': True,
                'path': path,
                'path_details': path_details,
                'distance': calculate_path_distance(path_details)
            })
        else:
            return jsonify({
                'success': False,
                'error': f'No path found between {start_id} and {end_id}'
            })
    
    except Exception as e:
        logger.error(f"Error finding path: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/nodes')
def get_nodes():
    """Get all nodes."""
    if graph_data is None:
        load_graph_data()
    
    return jsonify({
        'nodes': graph_data['nodes'],
        'count': len(graph_data['nodes'])
    })

@app.route('/api/searchable-nodes')
def get_searchable_nodes():
    """Get only searchable nodes (classrooms, facilities, etc.)."""
    if graph_data is None:
        load_graph_data()
    
    searchable_nodes = [node for node in graph_data['nodes'] if node.get('searchable', False)]
    
    return jsonify({
        'nodes': searchable_nodes,
        'count': len(searchable_nodes)
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'graph_loaded': graph_data is not None,
        'node_count': len(graph_data['nodes']) if graph_data else 0
    })

def calculate_path_distance(path_details):
    """Calculate the total distance of a path."""
    if len(path_details) < 2:
        return 0
    
    total_distance = 0
    for i in range(len(path_details) - 1):
        current = path_details[i]
        next_node = path_details[i + 1]
        
        dx = next_node['x'] - current['x']
        dy = next_node['y'] - current['y']
        distance = (dx ** 2 + dy ** 2) ** 0.5
        total_distance += distance
    
    return round(total_distance, 2)

if __name__ == '__main__':
    # Load graph data on startup
    load_graph_data()
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    app.run(host='0.0.0.0', port=port, debug=False)