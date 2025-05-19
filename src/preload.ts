import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
  generateSVG: () => ipcRenderer.invoke('generate-svg'),
  dockerContainer: () => ipcRenderer.invoke('docker-container'),
  selectProject: () => ipcRenderer.invoke('select-project'),
  toggleWatchLoop: () => ipcRenderer.invoke('toggle-watch-loop'),
  onGenerateNetlistEvent: (callback: () => void) => ipcRenderer.on('generate-netlist-event', callback)
});
