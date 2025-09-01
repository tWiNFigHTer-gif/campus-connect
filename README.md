# Campus Connect - Multi-Floor Navigation System

## 🏢 Multi-Floor Campus Navigation

An interactive campus navigation system supporting multiple floors with real-time pathfinding, search functionality, and zone-based exploration.

## ✨ Features

### 🗺️ **Multi-Floor Support**
- **2nd Floor**: Original campus layout (8830x6238)
- **3rd Floor**: Scaled layout (4259x2952) 
- **Seamless switching** between floors
- **Coordinated scaling** maintains exact node placements

### 🔍 **Smart Search System**
- Real-time search suggestions
- Searchable classrooms, departments, and facilities
- Keyboard navigation support
- Auto-complete with icons

### 🎯 **Interactive Navigation**
- **Click-to-navigate**: Click any two points for pathfinding
- **A* pathfinding algorithm** for optimal routes
- **Animated navigation**: Visual walking animation along path
- **Zone highlighting**: Interactive area exploration

### 📱 **Mobile-Responsive Design**
- Touch-friendly interface
- Pan and zoom gestures
- Double-tap zoom functionality
- Optimized for all screen sizes

### 🎨 **Visual Features**
- Glassmorphism UI design
- Smooth animations and transitions
- Color-coded zones and nodes
- Interactive feedback system

## 🚀 Quick Start

1. **Start a local server**:
   ```bash
   python -m http.server 8080
   ```

2. **Open in browser**:
   ```
   http://localhost:8080/campus-connect-merged.html
   ```

3. **Explore the campus**:
   - Search for locations using the search bar
   - Switch between floors using navigation buttons
   - Click on locations to get directions
   - Use explore buttons to highlight different zones

## 📁 Project Structure

```
campus-connect/
├── campus-connect-merged.html    # Main application
├── floors/
│   ├── second-floor.svg         # 2nd floor layout
│   └── third-floor.svg          # 3rd floor layout
├── data/
│   ├── pathfinding_graph_structural.json  # 2nd floor nodes
│   ├── third_floor_nodes.json             # 3rd floor nodes  
│   ├── svg_zones_8830x6238.json          # 2nd floor zones
│   └── third_floor_zones.json            # 3rd floor zones
├── assets/
│   └── (UI icons and images)
└── README.md
```

## 🏗️ Technical Implementation

### **Coordinate Scaling System**
- **2nd Floor**: 8830×6238 viewport
- **3rd Floor**: 4259×2952 viewport  
- **Scale factors**: X=0.482333, Y=0.473229
- **Maintains proportional positioning**

### **Node Data Structure**
```json
{
  "id": "class_1",
  "x": 1263.95,
  "y": 2338.93,
  "label": "3F Administration Block",
  "type": "class",
  "searchable": true,
  "cluster_size": 1
}
```

### **Multi-Floor Navigation**
- Dynamic SVG loading based on floor selection
- Floor-specific node data loading
- Coordinated panzoom settings for different aspect ratios
- Seamless floor switching with state preservation

## 🎮 Usage Guide

### **Navigation Controls**
- **Floor Buttons**: Switch between 2nd and 3rd floors
- **Search Bar**: Find specific locations instantly
- **Pan/Zoom**: Mouse wheel or touch gestures
- **Double-tap**: Quick zoom in/out

### **Pathfinding**
1. **Select start point**: Click any location or search
2. **Select destination**: Click another location  
3. **View route**: Animated path with navigation icon
4. **Clear path**: Use clear button or select new points

### **Zone Exploration**
- **Class Button**: Highlights all classroom areas in pink
- **Department Button**: Shows departmental zones
- **Facilities Button**: Displays faculty and staff areas

## 🔧 Development

### **Adding New Floors**
1. Create SVG file in `floors/` directory
2. Scale node coordinates using scaling factors
3. Create corresponding zone data file
4. Update floor navigation logic

### **Customizing Nodes**
- Edit JSON files in `data/` directory
- Modify node types, labels, and searchability
- Update graph connections for pathfinding

## 📊 Performance

- **Fast loading**: Optimized SVG and data loading
- **Smooth animations**: GPU-accelerated transforms
- **Memory efficient**: Dynamic data loading per floor
- **Mobile optimized**: Touch-first interaction design

## 🌟 Features Highlights

✅ **Real-time pathfinding** with visual feedback  
✅ **Multi-floor support** with proportional scaling  
✅ **Interactive search** with auto-suggestions  
✅ **Zone-based exploration** with visual highlighting  
✅ **Mobile-responsive** design for all devices  
✅ **Accessibility** features with keyboard navigation  

## 🚀 Live Demo

Open `campus-connect-merged.html` in a modern web browser with a local server for the full experience!

---

**Built with ❤️ for seamless campus navigation**
