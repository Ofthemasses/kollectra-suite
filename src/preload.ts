import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
  generateSVG: () => ipcRenderer.invoke('generate-svg'),
  dockerContainer: () => ipcRenderer.invoke('docker-container'),
  selectProject: () => ipcRenderer.invoke('select-project')
});
