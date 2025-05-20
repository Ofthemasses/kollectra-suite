import './index.css';
const svgPanZoom = require('svg-pan-zoom');
const directoryPicker = document.getElementById('dirs');
const selectedProject = document.getElementById('selectedProject');
const generateNetlistButton: HTMLInputElement = <HTMLInputElement> document.getElementById('generateNetlist');
const watchDirectoryButton: HTMLInputElement = <HTMLInputElement> document.getElementById('watchDirectory');

const LoadingText = "Loading Project"
const GeneratingText = "Generating Netlist"
const GenerateButtonText = "Generate Netlist Schematics"
const WatchButtonText = "Watch Directory"
const WatchingText = "Watching..."

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

directoryPicker.addEventListener('click', async () => {
    selectedProject.innerText = LoadingText;
    const result = await window.electronAPI.selectProject();
    console.log(result);
    selectedProject.innerText = result;
});

async function generateNetlistButtonEvent() {
    generateNetlistButton.disabled = true;
    generateNetlistButton.innerText = GeneratingText;
    await renderNetlist();
    generateNetlistButton.disabled = false;
    generateNetlistButton.innerText = GenerateButtonText;
}

generateNetlistButton.addEventListener('click', generateNetlistButtonEvent);

window.electronAPI.onGenerateNetlistEvent(generateNetlistButtonEvent);

watchDirectoryButton.addEventListener('click', async () => {
    watchDirectoryButton.innerText = await window.electronAPI.toggleWatchLoop() ? WatchingText : WatchButtonText;
});
