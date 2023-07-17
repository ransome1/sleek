const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDebug) {
  require('electron-debug')();
}
import { app, BrowserWindow, shell, Menu, globalShortcut } from 'electron';
import path from 'path';
import { configStorage } from './config';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import menu from './menu';
import { resolveHtmlPath } from './util';
import createFileWatchers from './modules/FileWatchers';
import './modules/ipcEvents';

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

const handleClosed = () => {
  mainWindow = null;
  delete eventListeners.readyToShow;
  delete eventListeners.closed;
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

  Menu.setApplicationMenu(menu);

  mainWindow
  .on('ready-to-show', handleReadyToShow)
  .on('closed', handleClosed);
}

const handleReadyToShow = async () => {

  const files = configStorage.get('files') as { path: string }[];
  try {
    const response = await createFileWatchers(files);
    console.log(response);
  } catch(error) {
    console.log(error)
  } 

  if (process.env.START_MINIMIZED) {
    if (mainWindow) {
      mainWindow.minimize();
    }
  } else {
    if (mainWindow) {
      mainWindow.show();
    }
  }

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
  delete eventListeners.willQuit;
}

const handleBeforeQuit = () => {
  app.releaseSingleInstanceLock();
  delete eventListeners.beforeQuit;
}

const handleActivate = () => {
  if (mainWindow === null) {
    createWindow();
  }
}

app
  .on('window-all-closed', handleWindowAllClosed)
  .on('will-quit', handleWillQuit)
  .on('before-quit', handleBeforeQuit)
  .whenReady()
  .then(() => {
    eventListeners.readyToShow = handleReadyToShow;
    eventListeners.closed = handleClosed;

    createWindow();

    globalShortcut.unregister('CmdOrCtrl+R');
    globalShortcut.unregister('F5');
    
    app.on('activate', handleActivate);
    eventListeners.activate = handleActivate;
  })
  .catch(console.error);

export { mainWindow };
