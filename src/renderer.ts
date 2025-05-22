import './index.css';
const svgPanZoom = require('svg-pan-zoom');
const directoryPicker = document.getElementById('dirs');
const selectedProject = document.getElementById('selectedProject');
const generateNetlistButton: HTMLInputElement = <HTMLInputElement> document.getElementById('generateNetlist');
const watchDirectoryButton: HTMLInputElement = <HTMLInputElement> document.getElementById('watchDirectory');
const topModuleSelector: HTMLSelectElement = <HTMLSelectElement> document.getElementById('topModule');
const selectedModuleSelector: HTMLSelectElement = <HTMLSelectElement> document.getElementById('selectedModule');

const LoadingText = "Loading Project"
const GeneratingText = "Generating Netlist"
const GenerateButtonText = "Generate Netlist Schematics"
const WatchButtonText = "Watch Directory"
const WatchingText = "Watching..."

async function renderNetlist() {
  try {
    const container: HTMLElement = document.getElementById('svgContainer');
    if (!container) throw new Error('SVG container not found');

    const svgString = await window.electronAPI.generateSVG();
    container.innerHTML = svgString;
    const svg = container.getElementsByTagName('svg')[0]
    svg.style.width = "100%";
    svg.style.height = "100%";
    svgPanZoom(svg,
               {
                   minZoom: 0
               })
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

watchDirectoryButton.addEventListener('click', async () => {
    watchDirectoryButton.innerText = await window.electronAPI.toggleWatchLoop() ? WatchingText : WatchButtonText;
});

topModuleSelector.addEventListener("change", (event) => {
    window.electronAPI.sendTopModule((<HTMLSelectElement> event.target).value);
});

selectedModuleSelector.addEventListener("change", (event) => {
    window.electronAPI.sendSelectableModule((<HTMLSelectElement> event.target).value);
});

window.electronAPI.onGenerateNetlistEvent(generateNetlistButtonEvent);

window.electronAPI.onModuleDataEvent((data) => {
    function addModuleToSelector(modules: string[], selector: HTMLSelectElement, previousValue?: string){
        modules.forEach(moduleText => {
            const option = document.createElement("option");
            option.value = moduleText;
            option.text = moduleText;
            selector.appendChild(option);
        });

        if (previousValue && modules.includes(previousValue)) {
            selector.value = previousValue;
        }
    }

    const prevTopValue = topModuleSelector.value;
    const prevSelectedValue = selectedModuleSelector.value;

    topModuleSelector.innerHTML = '';
    selectedModuleSelector.innerHTML = '';

    addModuleToSelector(data.tops, topModuleSelector, prevTopValue);
    addModuleToSelector(data.selectables, selectedModuleSelector, prevSelectedValue);
});
