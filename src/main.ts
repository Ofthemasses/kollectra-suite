import { app, dialog, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
const fs = require('fs');
const path = require('path');
const netlistsvg = require('netlistsvg');
const Docker = require('dockerode');
const tar = require('tar-fs');

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
let mainWindow: any;
const yosysModuleGetCommand = "/opt/oss-cad-suite/bin/yosys -Q -T -p 'read_verilog src/*; read_verilog generated/*; ls' | sed -n '/modules:/,/^$/ { /modules:/d; /^$/d; s/^[[:space:]]*//; p }'"

let yosysModulesArray: string[];
let yosysTop: string;
let yosysSelectedModule: string;

const yosysNetlistCommand = (): string => { return "/opt/oss-cad-suite/bin/yosys -p \"read_verilog src/*.v; read_verilog generated/*.v; prep -top " + yosysTop + "; select -module " + yosysSelectedModule + "; write_json -selected /synth.json\""}


async function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

async function generateSVG () {
    if (!DockerContainer.isDockerContainerInitialised()){
        console.error("Container not initialised");
        return null;
    }

    await refreshModules();
    await DockerContainer.runCommandInShell("cd /yosys-project && " + yosysNetlistCommand());

    const netlistRawData = await DockerContainer.runCommandInShell('cat /synth.json');

    try {
      console.log(__dirname);
      const digital = fs.readFileSync(
        path.join(__dirname, 'resources/netlistsvg/default.svg'),
        'utf8'
      );
      const netlistData = JSON.parse(netlistRawData);
      console.log(netlistData);
      return netlistsvg.render(digital, netlistData);
    } catch (err) {
      console.error('Error generating SVG:', err);
      throw err;
    }
};

async function selectProject(){
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    })
    console.log(result.filePaths[0]);
    if (!result.canceled){
       if (!DockerContainer.isDockerContainerInitialised()) await DockerContainer.initDockerContainer();
       await DockerContainer.switchDirectory(result.filePaths[0]);
       await refreshModules();
    }
    return DockerContainer.hostDir;
}

async function refreshModules() {
    const modulesRaw: string = await DockerContainer.runCommandInShell('cd /yosys-project && ' + yosysModuleGetCommand);
    yosysModulesArray = modulesRaw.split('\n');
    yosysTop = yosysModulesArray.includes(yosysTop) ? yosysTop : yosysModulesArray[0];
    yosysSelectedModule = yosysModulesArray.includes(yosysSelectedModule) ? yosysSelectedModule : yosysModulesArray[0];
}

class DockerContainer {
  static readonly dockerFilePath = path.join(__dirname, 'resources/container');
  static readonly imageName = 'kollectra-suite-layer';

  static hostDir: string = null;
  static readonly containerMountPoint = '/yosys-project';

  static dockerInstance: any = null;
  static persistentContainer: any = null;
  static shellStream: any = null;
  static watcherActive: boolean = false;

  static isDockerContainerInitialised() {
      return this.dockerInstance != null;
  }

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
      AttachStderr: true,
    }

    if (this.hostDir !== null){
        containerSettings["HostConfig"] = {
            Binds: [`${this.hostDir}:${this.containerMountPoint}:rw`]
        }
    }

    const ctr = await this.dockerInstance.createContainer(containerSettings);

    const stream = await ctr.attach({
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true,
    });

    this.processStream(stream);

    await ctr.start();

    this.persistentContainer = ctr;
    this.shellStream = stream;

    console.log("Container shell started.");
  }

  static async runCommandInShell(command: string): Promise<string> {
    if (!this.persistentContainer) {
      throw new Error('No running container');
    }

    const exec = await this.persistentContainer.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start({ hijack: true, stdin: false });

    const { PassThrough } = require('stream');
    const stdoutStream = new PassThrough();
    const stderrStream = new PassThrough();

    this.dockerInstance.modem.demuxStream(stream, stdoutStream, stderrStream);

    return new Promise<string>((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      stdoutStream.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      stderrStream.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      stream.on('end', () => {
        if (stderr) {
          console.error('Command stderr:', stderr);
        }
        resolve(stdout.trim());
      });

      stream.on('error', (err: any) => reject(err));
    });
  }

  static toggleWatchLoop(): boolean {
    this.watcherActive = !this.watcherActive;
    return this.watcherActive;
  }

  private static processStream(stream: NodeJS.ReadableStream): void {
    const TOKEN = '[WATCHER]';
    let buffer = '';
    stream.on('data', chunk => {
      buffer += chunk.toString();
      let idx: number;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        if (line.includes(TOKEN) && this.watcherActive) {
            mainWindow.webContents.send('generate-netlist-event');
        }
      }
    });
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
    ipcMain.handle('select-project', selectProject);
    ipcMain.handle('toggle-watch-loop', () => DockerContainer.toggleWatchLoop());
});

app.on('window-all-closed', () => {
  DockerContainer.stopDockerContainer().then(() => {
      if (process.platform !== 'darwin') app.quit();
  });
});
