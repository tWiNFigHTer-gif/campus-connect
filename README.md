# Campus Connect

A comprehensive campus navigation system with advanced pathfinding capabilities for indoor navigation.

## 🚀 Quick Start

1. **Run the Application**:
   ```bash
   python -m http.server 8000
   ```
   
2. **Open Browser**: Navigate to `http://localhost:8000`

3. **Navigate**: 
   - Select floor (2nd or 3rd)
   - Click source room, then destination room
   - View the optimal path with turn-by-turn directions

## 🏗️ Architecture

### File Structure
```
campus-connect/
├── campus-connect-merged.html    # Main application
├── data/
│   ├── second_floor_nodes.json   # 2nd floor rooms & pathfinding graph
│   ├── second_floor_zones.json   # 2nd floor zone coordinates
│   ├── third_floor_nodes.json    # 3rd floor rooms & pathfinding graph
│   └── third_floor_zones.json    # 3rd floor zone coordinates
├── floors/
│   ├── second-floor.svg          # 2nd floor layout
│   └── third-floor.svg           # 3rd floor layout
└── assets/                       # UI icons and resources
```

## 🔄 Third Floor Pathfinding System

### Dual Circular Route Architecture

**🔄 First Circular Route:**
- **hub4** → **315** → **316** → **317** → **318** → **304** → **305** → **306** → **hub1** → **319** → **320** → **321** → **hub4**

**🔄 Second Circular Route:**
- **hub3** → **corridor1** → **308** → **309** → **310** → **311** → **stairB** → **302** → **corridor2** → **312** → **313** → **hub3**

**🔺 Hub2 Triangle:**
- **hub2** → **303** → **307** → **hub2** (+ **301**)

**🌉 Hub Interconnections:**
- hub1 ↔ hub3 (connects first route to second route)
- hub3 ↔ hub4 (connects second route to first route)
- hub2 ↔ hub3 (connects triangle to second route)

### Key Features
- ✅ **No Wall Crossing**: Paths follow corridors and avoid `#808080` borders
- ✅ **Optimized Routing**: 38 bidirectional connections for efficient pathfinding  
- ✅ **Complete Coverage**: All 21 third floor rooms connected via circular routes
- ✅ **Hub-Based Navigation**: Strategic connection points for cross-route travel

## 🧪 Example Paths

| From | To | Route |
|------|----|----|
| 304 | 309 | 304→318→317→316→315→hub4→hub3→308→309 |
| 315 | 302 | 315→hub4→hub3→corridor1→308→...→302 |
| 303 | 320 | 303→307→hub2→hub3→hub1→320 |

## 🛠️ Technical Details

- **Algorithm**: Dijkstra's shortest path with Euclidean distance weights
- **Graph Structure**: Bidirectional connections with calculated distances
- **Coordinate System**: SVG-based positioning (4259x2952px for 3rd floor)
- **Path Visualization**: Real-time SVG path rendering with directional arrows

## 📊 Statistics

- **Total Rooms**: 21 (3rd floor) + 16 (2nd floor)
- **Connection Points**: 4 main hubs + 2 invisible corridor points  
- **Graph Connections**: 38 bidirectional (3rd floor)
- **Path Efficiency**: Average 3-8 hops between any two rooms
