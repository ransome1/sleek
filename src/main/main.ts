const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDebug) {
  require('electron-debug')();
}
import { app, BrowserWindow, Rectangle, Menu } from 'electron';
import path from 'path';
import { configStorage } from './config';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import buildMenu from './menu';
import { resolveHtmlPath } from './util';
import createFileWatcher from './modules/FileWatcher';
import './modules/Ipc';

interface File {
  active: boolean;
  path: string;
  filename: string;
}
const files: File[] = (configStorage.get('files') as File[]) || [];

let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify().then(result => {
      console.log('main.ts: Update check completed:', result);
    }).catch(error => {
      console.error('main.ts: Error checking for updates:', error);
    });
  }
}

const handleClosed = () => {
  mainWindow = null;
  delete eventListeners.readyToShow;
  delete eventListeners.closed;
}

const handleResize = () => {
  if (mainWindow) {
    const { width, height } = mainWindow.getBounds();
    configStorage.set('windowDimensions', { width, height });
  }  
}

const handleMove = () => {
  if (mainWindow) {
    const { x, y } = mainWindow.getBounds();
    configStorage.set('windowPosition', { x, y });
  }  
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
  
  const windowDimensions: { width: number; height: number } | null = configStorage.get('windowDimensions') as { width: number; height: number } | null;

  if (windowDimensions) {
    const { width, height } = windowDimensions;
    mainWindow.setSize(width, height);

    const windowPosition: { x: number; y: number } | null = configStorage.get('windowPosition') as { x: number; y: number } | null;
    if (windowPosition) {
      const { x, y } = windowPosition;
      mainWindow.setPosition(x, y);
    }
  }

  buildMenu(files);

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow
    .on('ready-to-show', handleReadyToShow)
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('closed', handleClosed);
  return "Main window has been created successfully"
}

const handleReadyToShow = async () => {
  if (process.env.START_MINIMIZED) {
    if (mainWindow) {
      mainWindow.minimize();
    }
  } else {
    if (mainWindow) {
      mainWindow.show();
    }
  }
  try {
    if(files && Object.keys(files)?.length > 0) {
      const response = await createFileWatcher(files);
      console.log('main.ts:', response);
    }
  } catch (error) {
    console.log(error);
  }  
  // if (!isDebug) {
  //   eventListeners.appUpdater = new AppUpdater();
  // }
}

const handleWindowAllClosed = () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

const handleWillQuit = () => {
  delete eventListeners.willQuit;
}

const handleBeforeQuit = () => {
  app.releaseSingleInstanceLock();
  delete eventListeners.beforeQuit;
}

const handleActivate = () => {
  if (mainWindow === null) {
    createWindow().then(result => {
      console.log('Main window created:', result);
    }).catch(error => {
      console.error('Error creating main window:', error);
    });
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
    createWindow().then(result => {
      console.log('main.ts:', result);
    }).catch(error => {
      console.error('main.ts:', error);
    });
    app.on('activate', handleActivate);
    eventListeners.activate = handleActivate;
  })
  .catch(console.error);

export { mainWindow };
