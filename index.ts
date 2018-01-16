import { BrowserWindow, app, ipcMain, Event } from "electron";
import * as ntClient from "wpilib-nt-client";
import * as fs from "fs";
import * as vm from 'vm'

// Extract options from the main file
const mainOptions = getJson<mainOptions>('options.json').catch(() => createMainOptions())
// Check and get Modules
const modules = getModules('modules')

/** Client for WPILIB NetworkTables */
const nt = new ntClient.Client();
/** Electron Window */
let window: BrowserWindow | null;

let connected: () => void,
  ready = false;
function createWindow() {
  // Create the browser window.
  window = new BrowserWindow({
    width: 1366,
    height: 570,
    // 1366x570 is a good standard height, but you may want to change this to fit your DriverStation's screen better.
    // It's best if the dashboard takes up as much space as possible without covering the DriverStation application.
    // The window is closed until the python server is ready
    show: false
  });
  // Attempt to connect to the localhost
  nt.start((con, err) => {
    // If the Window is ready than send the connection status to it
    if (ready) {
      sendTo(window, "connected", con);
    } else connected = () => sendTo(window, "connected", con);
  });
  // When the script starts running send all usable modules with their settings
  ipcMain.on("ready", (ev: Event, mesg: {}) => {
    Promise.all([mainOptions, modules]).then(([options, modules]) => {
      sendTo(window, 'options', { root: options.root })

      let optionModules = options.modules
      let optModuleNames = optionModules.map(a => a.name)
      let modsInOpt: number[] = []
      let addToOpt: mainOptionModule[] = []
      let toSend: sentModule[] = []
      for (let mod of modules) {
        let t = optModuleNames.indexOf(mod.name)
        toSend.push({ loc: mod.dir, module: mod })
        if (t >= 0) {
          modsInOpt.push(t)
          if ('shown' in options.modules[t]) {
            toSend[toSend.length - 1].shown = options.modules[t].shown
          }
        } else {
          let mop: mainOptionModule = { dirName: mod.dir, name: mod.name }
          if ('version' in mod) {
            mop.version = mod.version
          }
          addToOpt.push(mop)
        }
      }
      if (addToOpt.length > 0) {
        let optionsCopy = Object.assign({}, options)
        optionsCopy.modules.push(...addToOpt)
        fs.writeFile('options.json', JSON.stringify(optionsCopy, null, '\t'))
      }
      sendTo(window, 'modules', toSend)
    })
    ready = true;
    // Send connection message to the window if if the message is ready
    if (connected) connected();
  });

  // When the user chooses the address of the bot than try to connect
  ipcMain.on(
    "connect",
    (ev: Event, address: string, port: number | undefined) => {
      let callback = (connected: boolean, err: Error) => {
        sendTo(window, "connected", connected);
      };
      if (port != undefined) {
        nt.start(callback, address, port);
      } else {
        nt.start(callback, address);
      }
    }
  );
  ipcMain.on("add", (ev: Event, mesg: { val: any; key: string; flags: number }) => {
      nt.Assign(mesg.val, mesg.key, (mesg.flags & 1) === 1);
    }
  );
  ipcMain.on("update", (ev: Event, mesg: { id: number; val: any }) => {
    nt.Update(mesg.id, mesg.val);
  });
  // Listens to the changes coming from the client
  nt.addListener((key, val, valType, mesgType, id, flags) => {
    sendTo(window, mesgType, { key, val, valType, id, flags });
  });
  // Move window to top (left) of screen.
  window.setPosition(0, 0);
  // Load window.
  window.loadURL(`file://${__dirname}/index.html`);
  // Once the python server is ready, load window contents.
  window.once("ready-to-show", function () {
    (<BrowserWindow>window).show();
  });

  // Remove menu
  window.setMenu(null);
  // Emitted when the window is closed.
  window.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null;
  });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", () => {
  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q.
  // Not like we're creating a consumer application though.
  // Let's just kill it anyway.
  // If you want to restore the standard behavior, uncomment the next line.

  // if (process.platform !== "darwin")
  app.quit();
});

app.on("quit", function () {
  console.log("Application quit.");
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window == null) createWindow();
});

/**
 * Send Message to a window
 * @param window A window to send data to
 * @param key Key assigned to the data
 * @param data Data being sent
 */
function sendTo(window: BrowserWindow | null, key: string, ...data: any[]) {
  if (window instanceof BrowserWindow) {
    window.webContents.send(key, ...data);
  }
}

/**
 * Get names of files and folders from a directory
 * @param loc location of directory
 */
function getDirContent(loc: string) {
  return new Promise<string[]>((res, rej) => {
    fs.readdir(loc, "utf8", (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    });
  });
}

/**
 * Check if location is pointing to a directory
 * 
 * Returns the location if true
 * @param loc location being checked
 */
function isDir(loc: string) {
  return new Promise<boolean | string>((res, rej) => {
    fs.lstat(loc, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data.isDirectory() && loc);
      }
    });
  });
}

/**
 * Get module Options
 * @param loc location being checked
 */
function isModOptions(loc: string) {
  return isDir(loc).then(location => location && new Promise<boolean | string>((res, rej) => {
    fs.exists(location + "/options.json", (exists) => {
      res(exists && location)
    })
  })).then(location => {
    if (typeof location != 'string') return 
    else return getJson<moduleOptions>(location + "/options.json").then(options=>checkModOptions(location,options))
  })
}

/**
 * Checks if module has required options
 * 
 * Returns the options with the location added if true
 * @param loc location of module
 * @param mod Module Options
 */
function checkModOptions(loc:string,mod: moduleOptions & {dir?:string})  {
  if (typeof mod.name == 'string' && typeof mod.version == 'string' && (typeof mod.js == 'string' || typeof mod.html == 'string')) {
    mod.dir = loc
    return mod
  }
}
/**
 * Gets module options from their directory
 * @param loc Directory of all modules
 */
function getModules(loc: string) {
  return getDirContent(loc)
    .then(dirContents => Promise.all(dirContents.map(b => isModOptions(loc + "/" + b))))
    .then(modOptions => modOptions.filter(modOpt => modOpt != null) as (moduleOptions & {dir:string})[])
}
/**
 * Parses JSON from a file
 * @param loc Location of the file
 */
function getJson<t>(loc: string) {
  return new Promise<t>((res, rej) => {
    fs.readFile(loc, 'utf8', (err, data) => {
      if (err) {
        rej(err)
      } else {
        res(JSON.parse(data))
      }
    })
  })
}
/**
 * Creates a new options.json file
 */
function createMainOptions(): mainOptions {
  let options:mainOptions = {
    root: '/SmartDashboard/',
    modules: []
  }
  fs.writeFile('options.json',JSON.stringify(options,null,'\t'))
  return options
}