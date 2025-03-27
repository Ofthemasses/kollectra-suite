import { app, BrowserWindow, ipcMain } from 'electron';
const fs = require('fs');
const path = require('path');
const netlistsvg = require('netlistsvg');

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

async function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

async function generateSVG () {
    try {
      console.log(__dirname);
      const digital = fs.readFileSync(
        path.join(__dirname, 'resources/netlistsvg/default.svg'),
        'utf8'
      );
      const netlistData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'resources/synth.json'), 'utf8')
      );
      return netlistsvg.render(digital, netlistData);
    } catch (err) {
      console.error('Error generating SVG:', err);
      throw err;
    }
};

app.whenReady().then(() => {
    createWindow();
    ipcMain.handle('generate-svg', generateSVG);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
