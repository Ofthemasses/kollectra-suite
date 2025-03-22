const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const netlistsvg = require('netlistsvg');

async function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  await mainWindow.loadFile('index.html');
}

async function generateSVG () {
    try {
      const digital = fs.readFileSync(
        __dirname + '/../node_modules/netlistsvg/lib/default.svg', 
        'utf8'
      );
      const netlistData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'synth.json'), 'utf8')
      );
      console.log("TEST");
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
