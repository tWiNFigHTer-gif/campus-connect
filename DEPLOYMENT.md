# Campus Connect - Render Deployment Guide

This document describes how to deploy the Campus Connect application on Render.

## Overview

Campus Connect is a web-based campus navigation system with:
- **Frontend**: Interactive HTML/CSS/JS application with floor plan navigation
- **Backend**: Python Flask API for pathfinding and navigation graph management
- **Data**: JSON navigation graphs and SVG floor plans

## Deployment Architecture

The application is deployed as a single web service on Render that:
1. Serves the frontend HTML/CSS/JS files as static content
2. Provides REST API endpoints for pathfinding and navigation data
3. Automatically generates or loads navigation graph data on startup

## Render Deployment Options

### Option 1: Automatic Deployment (Recommended)

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Auto-detection**: Render will automatically detect the `render.yaml` configuration
3. **Deployment**: The service will deploy automatically using the configuration

### Option 2: Manual Web Service Creation

1. **Create Web Service**: In Render dashboard, create a new "Web Service"
2. **Connect Repository**: Link to your GitHub repository
3. **Configuration**:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Plan**: Free tier (or choose your preferred plan)

## Environment Variables

No additional environment variables are required. The application uses:
- `PORT`: Automatically provided by Render for the web service port

## Files and Structure

### Core Application Files
- `app.py` - Flask web server with API endpoints
- `campus-connect-final.html` - Main web application
- `campus-connect-simple.html` - Simple version of the application
- `extract_structural_routing.py` - Pathfinding algorithm and graph generation

### Deployment Configuration
- `render.yaml` - Render service configuration
- `requirements.txt` - Python dependencies
- `Procfile` - Alternative process file for deployment

### Data Files
- `pathfinding_graph_structural.json` - Navigation graph data
- `2nd-floor-map.svg` - Floor plan SVG
- `assistant-navigation-icon.svg` - Navigation icon

## API Endpoints

The Flask backend provides several REST API endpoints:

- `GET /` - Main application interface
- `GET /simple` - Simple application interface
- `GET /api/health` - Health check and status
- `GET /api/graph` - Complete navigation graph data
- `GET /api/nodes` - All navigation nodes
- `GET /api/searchable-nodes` - Only searchable nodes (classrooms, facilities)
- `GET /api/path?start=<node_id>&end=<node_id>` - Find path between two nodes

## Local Development

To run the application locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py

# Application will be available at http://localhost:5000
```

## Features

- **Interactive Floor Plan**: Click-based node selection on SVG floor plan
- **Smart Pathfinding**: A* algorithm with weighted edges for optimal routing
- **Multiple Node Types**: Classrooms, corridor waypoints, stairway access points
- **REST API**: Programmatic access to pathfinding and navigation data
- **Responsive Design**: Works on desktop and mobile devices

## Production Considerations

- **Static File Serving**: All static assets (HTML, CSS, JS, SVG) are served by Flask
- **Graph Data**: Navigation graph is loaded/generated on application startup
- **Performance**: Uses gunicorn WSGI server for production deployment
- **CORS**: Cross-Origin Resource Sharing enabled for API endpoints

## Troubleshooting

### Common Issues

1. **Graph Data Not Loading**: 
   - Check that `pathfinding_graph_structural.json` exists
   - If missing, the application will generate it automatically from coordinates

2. **SVG Not Loading**:
   - Ensure `2nd-floor-map.svg` file is present in the repository
   - Check browser console for network errors

3. **API Endpoints Not Working**:
   - Verify Flask server is running
   - Check `/api/health` endpoint for status

### Logs and Monitoring

- **Application Logs**: Available in Render dashboard under service logs
- **Health Check**: Use `/api/health` endpoint to verify service status
- **Debug Mode**: Set `debug=True` in `app.py` for development (not recommended for production)

## Updating Deployment

To update the deployment:
1. Push changes to your GitHub repository
2. Render will automatically redeploy if auto-deploy is enabled
3. Manual redeploy option available in Render dashboard