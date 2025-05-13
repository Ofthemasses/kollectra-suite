export interface IElectronAPI {
  generateSVG: () => Promise<string>,
  dockerContainer: () => void,
  selectProject: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
