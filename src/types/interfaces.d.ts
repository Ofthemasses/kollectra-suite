export interface IElectronAPI {
  generateSVG: () => Promise<string>,
  selectProject: () => Promise<string>,
  toggleWatchLoop: () => boolean,
  sendTopModule: (moduleName: string) => void,
  sendSelectableModule: (moduleName: string) => void,
  onGenerateNetlistEvent: (callback: () => void) => void
  onModuleDataEvent: (callback: (data: ModulePayload) => void) => void
}


declare global {
  interface ModulePayload {
      tops: string[];
      selectables: string[];
  }
  interface Window {
    electronAPI: IElectronAPI
  }
}
