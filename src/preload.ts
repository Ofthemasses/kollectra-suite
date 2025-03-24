const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateSVG: () => ipcRenderer.invoke('generate-svg')
});
