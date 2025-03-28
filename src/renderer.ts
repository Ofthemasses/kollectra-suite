import './index.css';
const svgPanZoom = require('svg-pan-zoom');

async function renderNetlist() {
  try {
    const container = document.getElementById('svgContainer');
    if (!container) throw new Error('SVG container not found');

    const svgString = await window.electronAPI.generateSVG();
    container.innerHTML = svgString;
    svgPanZoom(container.getElementsByTagName('svg')[0],
               {minZoom: 0})
  } catch (err) {
    console.error('Error rendering netlist:', err);
  }
}

renderNetlist();
