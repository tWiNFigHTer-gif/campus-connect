// Load SVG Helper Script
function loadExternalSVG() {
    fetch('./3rd_floor.svg')
        .then(response => response.text())
        .then(svgContent => {
            // Parse the SVG content
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const externalSVG = svgDoc.documentElement;
            
            // Get the floor plan group in our HTML
            const floorPlanGroup = document.getElementById('floor-plan');
            
            // Clear existing content and add the external SVG content
            floorPlanGroup.innerHTML = '';
            
            // Copy all child nodes from external SVG to our floor plan group
            Array.from(externalSVG.childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    floorPlanGroup.appendChild(node.cloneNode(true));
                }
            });
            
            console.log('3rd floor SVG plan loaded successfully');
        })
        .catch(error => {
            console.error('Error loading 3rd floor SVG:', error);
        });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadExternalSVG);
