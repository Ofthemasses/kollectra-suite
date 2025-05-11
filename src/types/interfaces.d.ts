export interface IElectronAPI {
  generateSVG: () => Promise<string>,
  dockerContainer: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
