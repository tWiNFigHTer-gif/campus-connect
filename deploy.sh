#!/bin/bash
# Deployment script for Campus Connect Multi-Floor

echo "🚀 Campus Connect Multi-Floor Deployment Script"
echo "================================================"

# Essential files for the multi-floor campus connect system
FILES_TO_INCLUDE=(
    "campus-connect-merged.html"
    "floors/second-floor.svg"  
    "floors/third-floor.svg"
    "data/pathfinding_graph_structural.json"
    "data/third_floor_nodes.json"
    "data/svg_zones_8830x6238.json" 
    "data/third_floor_zones.json"
    "assets/"
    "README.md"
)

echo "📁 Essential files for deployment:"
for file in "${FILES_TO_INCLUDE[@]}"; do
    echo "  ✅ $file"
done

echo ""
echo "🔧 Manual deployment steps:"
echo "1. Navigate to your repository directory"
echo "2. Copy the essential files listed above"
echo "3. Commit and push to GitHub"
echo ""
echo "📋 Git commands:"
echo "git add ."
echo "git commit -m 'Deploy Campus Connect Multi-Floor System'"
echo "git push origin main"
