export interface IElectronAPI {
  generateSVG: () => Promise<string>,
  selectProject: () => Promise<string>,
  toggleWatchLoop: () => boolean,
  onGenerateNetlistEvent: (callback: () => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
