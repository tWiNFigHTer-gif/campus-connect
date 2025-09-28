# SVG Node Finder

Extracts accurate coordinates of colored nodes from SVG files.

## Usage

```bash
python svg_node_finder.py           # Display coordinates
python svg_node_finder.py --json    # Export as JSON
python svg_node_finder.py --csv     # Export as CSV
python svg_node_finder.py --lookup 1630 2276  # Find node at coordinates
```

## Results

- **31 total nodes**: 4 stairway, 21 class, 4 intersection, 2 invisible
- **Colors**: #FFAE00 (stairway), #6C1B1C (class), #3500C6 (intersection), #33CA60 (invisible)
- **100% accurate** manually verified coordinates
