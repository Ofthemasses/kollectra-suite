const fs = require('fs');
const netlistsvg = require('netlistsvg');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fs: fs,
  path: path,
  netlistsvg: netlistsvg,
  generateSVG: async () => {
    try {
      const digital = fs.readFileSync(
        path.join(__dirname, 'node_modules', 'netlistsvg', 'lib', 'default.svg'),
        'utf8'
      );
      const netlistData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'synth.json'), 'utf8')
      );
      return netlistsvg.render(digital, netlistData);
    } catch (err) {
      console.error('Error generating SVG:', err);
      throw err;
    }
  }
});
