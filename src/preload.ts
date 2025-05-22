import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
  generateSVG: () => ipcRenderer.invoke('generate-svg'),
  selectProject: () => ipcRenderer.invoke('select-project'),
  toggleWatchLoop: () => ipcRenderer.invoke('toggle-watch-loop'),
  sendTopModule: (moduleName: string) => ipcRenderer.send('send-top-module', moduleName),
  sendSelectableModule: (moduleName: string) => ipcRenderer.send('send-selectable-module', moduleName),
  onGenerateNetlistEvent: (callback: () => void) => ipcRenderer.on('generate-netlist-event', (_event) => callback()),
  onModuleDataEvent: (callback: (data: ModulePayload) => void) => ipcRenderer.on('module-data-event', (_event: IpcRendererEvent, data: ModulePayload) => {
      callback(data)
  })
});
