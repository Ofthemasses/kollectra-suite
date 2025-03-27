import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
  generateSVG: () => ipcRenderer.invoke('generate-svg')
});
