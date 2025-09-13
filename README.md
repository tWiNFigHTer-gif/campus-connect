# SVG Node Coordinate Extractor

This repository contains tools to extract accurate coordinates of colored nodes from SVG files.

## 📁 Files

### Core Scripts
- **`svg_coordinate_extractor.py`** - **Main extractor** with the most accurate, verified coordinates
- **`svg_color_finder.py`** - Simple version for basic extraction

### Data Files  
- **`3rd floor swt (1).svg`** - Source SVG file
- **`FINAL_coordinates.txt`** - Human-readable coordinate results
- **`FINAL_coordinates.json`** - JSON format for programming
- **`FINAL_coordinates.csv`** - Spreadsheet format

## 🚀 Usage

**For most accurate coordinates:**
```bash
python svg_coordinate_extractor.py
```

**For simple extraction:**
```bash
python svg_color_finder.py
```

## 🎯 Coordinate Summary

- **31 total nodes** across 4 types
- **Stairway nodes**: 4 (yellow #FFAE00)
- **Class nodes**: 21 (red #6C1B1C) 
- **Intersection nodes**: 4 (blue #3500C6)
- **Invisible nodes**: 2 (green #33CA60)

## ✅ Verified Accuracy

All coordinates have been manually verified and corrected for:
- Proper node classification
- Accurate coordinate extraction
- Transformation handling

The `svg_coordinate_extractor.py` contains the final, most accurate coordinate set.
