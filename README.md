# Python SVG Node Finder

A Python tool for extracting coordinates of colored circle/ellipse nodes from SVG files.

## Overview

This project provides scripts to analyze SVG files and extract the coordinates of colored nodes based on specific fill colors. It's particularly useful for floor plan analysis or any SVG-based coordinate extraction tasks.

## Features

- **Accurate Coordinate Extraction**: Handles both ellipse and path elements
- **Multiple Color Support**: Extracts nodes by specific fill colors
- **Multiple Output Formats**: TXT, CSV, and JSON formats
- **Comprehensive Validation**: Includes bounds checking and error reporting
- **Transform Handling**: Accounts for SVG transformations

## Target Colors

The scripts are configured to find nodes with these specific colors:

- **#FFAE00**: Stairway nodes (yellow)
- **#33CA60**: Invisible nodes (green)
- **#3500C6**: Intersection nodes (blue)
- **#6C1B1C**: Class nodes (dark red)

## Files

### Scripts
- **`svg_color_finder.py`**: Main coordinate extraction script
- **`comprehensive_svg_extractor.py`**: Advanced extraction with detailed validation

### Input
- **`3rd floor swt (1).svg`**: Sample SVG file (4259 × 2952 pixels)

### Output Files
- **`colored_nodes_coordinates.txt`**: Basic output from main script
- **`COMPREHENSIVE_coordinates.txt`**: Detailed report with validation
- **`COMPREHENSIVE_coordinates.csv`**: Spreadsheet-compatible format
- **`COMPREHENSIVE_coordinates.json`**: Structured data format

## Usage

### Basic Extraction
```bash
python svg_color_finder.py
```

### Comprehensive Extraction
```bash
python comprehensive_svg_extractor.py
```

## Results

Current extraction from the sample SVG file finds **31 nodes**:
- **21 Class nodes** (#6C1B1C)
- **4 Stairway nodes** (#FFAE00)
- **4 Intersection nodes** (#3500C6)
- **2 Invisible nodes** (#33CA60)

## Coordinate System

All coordinates are extracted in the SVG coordinate system:
- **Origin**: Top-left corner (0, 0)
- **X-axis**: Left to right
- **Y-axis**: Top to bottom
- **Units**: SVG pixels

## Technical Details

### Ellipse Elements
- Direct extraction from `cx` and `cy` attributes
- Handles rotation transforms

### Path Elements
- Geometric center calculation from path coordinate bounds
- Comprehensive coordinate pair extraction using regex
- Bounding box center method for circular paths

## Requirements

- Python 3.x
- Standard library modules: `xml.etree.ElementTree`, `re`, `json`, `csv`

## License

Open source - feel free to modify and use for your projects.
