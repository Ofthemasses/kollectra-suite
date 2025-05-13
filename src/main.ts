import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
const fs = require('fs');
const path = require('path');
const netlistsvg = require('netlistsvg');
const Docker = require('dockerode');
const tar = require('tar-fs');

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

async function dockerContainer() {
    try {
        console.log("BEGIN");
		const result = await DockerContainer.initDockerContainer();
        console.log(result);
	} catch(error) {
        console.log(error);
    }
    try {
        await DockerContainer.switchDirectory("/home/finlay/Documents/Masters/kollectra");
        await DockerContainer.runCommandInShell("cd ../yosys-project && ls -a");
    } catch(error){
        console.log(error);
    }
}

class DockerContainer {
  static readonly dockerFilePath = path.join(__dirname, 'resources/container');
  static readonly imageName = 'kollectra-suite-layer';

  static hostDir: string = null;
  static readonly containerMountPoint = '/yosys-project';

  static dockerInstance: any = null;
  static persistentContainer: any = null;
  static shellStream: any = null;

  static async initDockerContainer() {
    this.dockerInstance = new Docker();
    await this.#buildImage();
    await this.#startDockerContainer();
  }

  static async switchDirectory(dir: string){
      await this.stopDockerContainer();
      this.hostDir = dir;
      await this.#startDockerContainer();
  }

  static #buildImage() {
    return new Promise<void>((resolve, reject) => {
      const tarStream = tar.pack(this.dockerFilePath);
      this.dockerInstance.buildImage(
        tarStream,
        { t: this.imageName },
        (err: any, stream: any) => {
          if (err) return reject(err);
          this.dockerInstance.modem.followProgress(
            stream,
            (err: any) => err ? reject(err) : resolve(),
            (event: any) => event.stream && process.stdout.write(event.stream)
          );
        }
      );
    });
  }

  static async #startDockerContainer() {
    if (this.persistentContainer) {
      console.warn("Container already started.");
      return;
    }

    let containerSettings: {[key: string]: any} = {
      Image: this.imageName,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true
    }

    if (this.hostDir !== null){
        containerSettings["HostConfig"] = {
            Binds: [`${this.hostDir}:${this.containerMountPoint}:rw`]
        };
    }

    const ctr = await this.dockerInstance.createContainer(containerSettings);

    const stream = await ctr.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
    });

    stream.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk.toString());
    });

    await ctr.start();

    this.persistentContainer = ctr;
    this.shellStream = stream;

    console.log("Container shell started.");
  }

  static async runCommandInShell(command: string) {
    if (!this.shellStream) {
      throw new Error('Shell stream not initialized');
    }

    this.shellStream.write(`${command}\n`);
  }

  static async stopDockerContainer() {
    if (!this.persistentContainer) {
      console.log('No running container.');
      return;
    }

    console.log('Stopping container…');
    await this.persistentContainer.stop();
    await this.persistentContainer.remove();
    this.persistentContainer = null;
    this.shellStream = null;
  }
}

app.whenReady().then(() => {
    createWindow();
    ipcMain.handle('generate-svg', generateSVG);
    ipcMain.handle('docker-container', dockerContainer);
});

app.on('window-all-closed', () => {
  DockerContainer.stopDockerContainer().then(() => {
      if (process.platform !== 'darwin') app.quit();
  });
});
