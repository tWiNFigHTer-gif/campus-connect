# Campus Connect - Interactive Floor Plan Navigation

A web-based campus navigation system with intelligent pathfinding through floor plans.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   python -m http.server 8000
   ```

2. **Open the application:**
   - Browser: http://localhost:8000/campus-connect-fixed.html

## 📁 Project Structure

### Core Files
- `campus-connect-fixed.html` - Main web application with interactive floor plan
- `extract_red_curves_enhanced.py` - Node extraction and graph generation script
- `pathfinding_graph.json` - Generated navigation graph data
- `2nd floor (1) replaced.svg` - Current floor plan SVG

### Assets
- `door.png` - Door icon reference
- `stairway2.png` - Stairway pattern reference  
- `str1mid.png` - Additional stairway reference

### Documentation
- `README.md` - This file
- `CAMPUS_CONNECT_FINAL_SUMMARY.md` - Project development summary

## 🎯 Features

- **Interactive Floor Plan**: Click-based node selection
- **Smart Pathfinding**: Dijkstra algorithm with weighted edges
- **Multiple Node Types**:
  - 🔵 Regular nodes (rooms/points of interest)
  - 🟢 Corridor waypoints  
  - 🔴 Stairway access points
- **Realistic Routing**: Step-by-step paths through neighboring nodes
- **Visual Path Display**: Highlighted routes on floor plan

## 🔧 Usage

### Regenerate Navigation Graph
```bash
python extract_red_curves_enhanced.py extract "2nd floor (1) replaced.svg" pathfinding_graph.json
```

### Test Pathfinding
```bash
python extract_red_curves_enhanced.py findpath pathfinding_graph.json node_8 node_2
```

## 🏗️ Architecture

1. **SVG Processing**: Extracts red path markers from floor plan
2. **Node Consolidation**: Groups nearby points (100px radius)
3. **Graph Enhancement**: Adds corridor and stairway nodes
4. **Weighted Connections**: Links nodes within 1400px radius
5. **Pathfinding**: Dijkstra algorithm for optimal routes

## 🌐 Browser Features

- **Node Selection**: Click nodes to set start/destination
- **Path Visualization**: Animated route display
- **Console Debugging**: Detailed pathfinding logs
- **Responsive Design**: Works on desktop and mobile

## 📊 Graph Statistics

- **27 Total Nodes**: 20 original + 5 corridors + 2 stairways
- **Single Connected Component**: All nodes reachable
- **Realistic Distances**: Physical pixel measurements
- **Optimal Routing**: Shortest weighted paths

## 🎮 How to Use

1. **Load the application** in your browser
2. **Click on a starting node** (blue/green/red circles)
3. **Click on a destination node**
4. **View the calculated path** highlighted on the floor plan
5. **Check browser console** for detailed pathfinding information

## 🛠️ Development

The system uses a hybrid approach combining:
- **Extracted floor plan nodes** from SVG red paths
- **Strategic corridor waypoints** for better connectivity  
- **Stairway access points** for multi-level navigation
- **Weighted graph algorithms** for optimal route calculation

## 📝 License

This project is part of a campus navigation system development.
