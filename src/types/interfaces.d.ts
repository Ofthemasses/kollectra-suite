export interface IElectronAPI {
  generateSVG: () => Promise<string>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
