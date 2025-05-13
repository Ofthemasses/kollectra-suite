import './index.css';
const svgPanZoom = require('svg-pan-zoom');
const directoryPicker = document.getElementById('dirs');
const selectedProject = document.getElementById('selectedProject');

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

async function runDocker(){
    await window.electronAPI.dockerContainer();
}

directoryPicker.addEventListener('click', async () => {
    const result = await window.electronAPI.selectProject();
    console.log(result);
    selectedProject.innerText = result;
});
