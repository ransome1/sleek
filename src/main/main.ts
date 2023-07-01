const appStartTime = process.hrtime();
const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDebug) {
  require('electron-debug')();
}
import { app, BrowserWindow, shell, Menu, globalShortcut } from 'electron';
import path from 'path';
import store from './config';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import menu from './menu';
import { resolveHtmlPath } from './util';
import createFileWatchers from './modules/FileWatchers';
import { activeFile } from './util';
import './modules/ipcEvents';

try {
  const files = store.get('files') as { path: string }[];
  if (files) createFileWatchers(files);
} catch (error) {
  console.error(error);
}  

let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify().then(result => {
      console.log('Update check completed:', result);
    }).catch(error => {
      console.error('Error checking for updates:', error);
    });
  }
}

const handleReadyToShow = () => {
  if (process.env.START_MINIMIZED) {
    if (mainWindow) {
      mainWindow.minimize();
    }
  } else {
    if (mainWindow) {
      mainWindow.show();
    }
  }

  const appEndTime = process.hrtime(appStartTime);
  const startupTime = (appEndTime[0] * 1000) + (appEndTime[1] / 1e6); // Convert to milliseconds

  console.log(`App fully loaded in ${startupTime.toFixed(2)} ms`);

  mainWindow?.webContents.send('writeToConsole', eventListeners.length);

}

const handleClosed = () => {
  mainWindow = null;
}

const createWindow = async() => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.resolve(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    icon: getAssetPath('icons/512x512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow
  .on('ready-to-show', handleReadyToShow)
  .on('closed', handleClosed);
  eventListeners['ready-to-show', handleReadyToShow]
  eventListeners['closed', handleClosed]

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  if (!isDebug) {
    eventListeners.appUpdater = new AppUpdater();
  }
}

const handleWindowAllClosed = () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

const handleWillQuit = () => {
  globalShortcut.unregisterAll();
}

const handleBeforeQuit = () => {
    Object.values(eventListeners).forEach(listener => listener());
    eventListeners = {};
}

const handleActivate = () => {
  if(mainWindow === null) {
    createWindow();
  }
}

app
  .on('window-all-closed', handleWindowAllClosed)
  .on('will-quit', handleWillQuit)
  .on('before-quit', handleBeforeQuit)
  .whenReady()
  .then(() => {
    
    createWindow();

    globalShortcut.unregister('CmdOrCtrl+R');
    globalShortcut.unregister('F5');
    
    app.on('activate', handleActivate);
  })
  .catch(console.error);

  eventListeners['window-all-closed', handleWindowAllClosed]
  eventListeners['will-quit', handleWillQuit]
  eventListeners['before-quit', handleBeforeQuit]
  eventListeners['activate', handleActivate]

export { mainWindow }