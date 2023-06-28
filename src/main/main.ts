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

export let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const appStartTime = process.hrtime();

if (isDebug) {
  require('electron-debug')();
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify()
      .then(result => {
        console.log('Update check completed:', result);
      })
      .catch(error => {
        console.error('Error checking for updates:', error);
      });
  }
}

const createWindow = async() => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.resolve(RESOURCES_PATH, ...paths);
  };

  try {
    const files = store.get('files') as { path: string }[];
    if (files) await createFileWatchers(files); // Wait for createFileWatchers to complete
  } catch (error) {
    console.error(error);
  }  

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

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  if (!isDebug) {
    eventListeners.appUpdater = new AppUpdater();
  }
};

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
};

const handleClosed = () => {
  mainWindow = null;
};

const removeEventListeners = () => {
  Object.values(eventListeners).forEach(listener => listener());
  eventListeners = {};
};

app
  .on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })
  .on('will-quit', () => {
    globalShortcut.unregisterAll();
  })
  .on('before-quit', removeEventListeners)
  .whenReady()
  .then(() => {
    globalShortcut.unregister('CmdOrCtrl+R');
    globalShortcut.unregister('F5');
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.error);
