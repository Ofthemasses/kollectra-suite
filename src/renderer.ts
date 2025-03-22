async function renderNetlist() {
  try {
    const container = document.getElementById('svgContainer');
    if (!container) throw new Error('SVG container not found');
    
    const svgString = await window.electronAPI.generateSVG();
    container.innerHTML = svgString;
  } catch (err) {
    console.error('Error rendering netlist:', err);
  }
}
