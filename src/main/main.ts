const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
if (isDebug) {
  require('electron-debug')();
}
import { app, BrowserWindow, Rectangle, Menu, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { configStorage } from './config';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import createMenu from './modules/Menu';
import { resolveHtmlPath, getAssetPath, File } from './util';
import createFileWatcher from './modules/File/Watcher';
import createTray from './modules/Tray';
import './modules/Ipc';
import handleTheme from './modules/Theme';

const files: File[] = (configStorage.get('files') as File[]) || [];
const windowMaximized: boolean = configStorage.get('windowMaximized');

let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify().then(result => {
//       console.log('main.ts: Update check completed:', result);
//     }).catch(error => {
//       console.error('main.ts: Error checking for updates:', error);
//     });
//   }
// }

const handleClosed = () => {
  mainWindow = null;
  delete eventListeners.readyToShow;
  delete eventListeners.closed;
}

const handleResize = () => {
  if (mainWindow) {
    const { width, height } = mainWindow?.getBounds();
    configStorage.set('windowDimensions', { width, height });
    configStorage.set('windowMaximized', false);
  }  
}

const handleMove = () => {
  if (mainWindow) {
    const { x, y } = mainWindow?.getBounds();
    configStorage.set('windowPosition', { x, y });
    configStorage.set('windowMaximized', false);
  }  
}

const handleUnmaximize = () => {
  configStorage.set('windowMaximized', false);
  handleWindowSizeAndPosition();
}

const handleMaximize = () => {
  configStorage.set('windowMaximized', true)
}

const handleShow = () => {
  if (app.dock) {
    app.dock.show();
  }
}

const handleWindowSizeAndPosition = () => {
  const isMaximized = configStorage.get('windowMaximized');
  if(isMaximized) {
    mainWindow?.maximize();
    return false;
  }

  const windowDimensions: { width: number; height: number } | null = configStorage.get('windowDimensions') as { width: number; height: number } | null;

  if (windowDimensions) {
    const { width, height } = windowDimensions;
    mainWindow?.setSize(width, height);

    const windowPosition: { x: number; y: number } | null = configStorage.get('windowPosition') as { x: number; y: number } | null;
    if (windowPosition) {
      const { x, y } = windowPosition;
      mainWindow?.setPosition(x, y);
    }
  }
};

const createWindow = async() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    icon: getAssetPath('icons/512x512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.ts'),
    },
  });

  const customStylesPath: string = configStorage.get('customStylesPath');
  if(customStylesPath) {
    fs.readFile(customStylesPath, 'utf8', (error: Error | null, data) => {
      if (!error) {
        mainWindow?.webContents.insertCSS(data);
        console.error('Styles injected found in CSS file:', customStylesPath);
      } else {
        console.error('Error reading the CSS file:', error);
      }
    });
  }

  handleTheme();

  handleWindowSizeAndPosition();
  
  mainWindow?.loadURL(resolveHtmlPath('index.html'));
  mainWindow
    .on('ready-to-show', handleReadyToShow)
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('show', handleShow)
    .on('closed', handleClosed)
    .on('maximize', handleMaximize)
    .on('unmaximize', handleUnmaximize);
  return "Main window has been created successfully"
}

const handleReadyToShow = async () => {
  // if (process.env.START_MINIMIZED) {
  //   if (mainWindow) {
  //     mainWindow?.minimize();
  //   }
  // } else {
  //   if (mainWindow) {
  //     mainWindow?.show();
  //   }
  // }
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
  const tray: boolean = configStorage.get('tray');
  if (process.platform !== 'darwin' && !tray) {
    app.quit();
  } else if (process.platform === 'darwin' && tray) {
    app.dock?.hide();
  } else {
    mainWindow?.hide();
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

    createMenu(files).then(result => {
      console.log('main.ts:', result);
    }).catch(error => {
      console.error('main.ts:', error);
    });

    createTray().then(result => {
      console.log('main.ts:', result);
    }).catch(error => {
      console.error('main.ts:', error);
    });

    app.on('activate', handleActivate);
    eventListeners.activate = handleActivate;
  })
  .catch(console.error);

export { mainWindow, createWindow };