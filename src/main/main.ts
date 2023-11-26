import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { configStorage } from './config';
import createMenu from './modules/Menu';
import { resolveHtmlPath, getAssetPath, File } from './util';
import createFileWatcher from './modules/File/Watcher';
import createTray from './modules/Tray';
import './modules/Ipc';
import handleTheme from './modules/Theme';

const environment = process.env.NODE_ENV;

const files: File[] = (configStorage.get('files') as File[]) || [];

let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

const handleCreateWindow = () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow()
      .then((result) => {
        console.log('main.ts:', result);
      })
      .catch((error) => {
        console.error('main.ts:', error);
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
}

const handleMaximize = () => {
  configStorage.set('windowMaximized', true)
}

const handleShow = () => {
  app.dock?.show();
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
}

const createWindow = async() => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    icon: process.platform === 'win32' ? getAssetPath('icons/sleek.ico') : getAssetPath('icons/512x512.png'),
    autoHideMenuBar: true,
    webPreferences: {
      spellcheck: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: environment === 'production'
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

  const colorTheme = configStorage.get('colorTheme');
  nativeTheme.themeSource = colorTheme;

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
  try {
    if(files && Object.keys(files)?.length > 0) {
      const response = createFileWatcher(files);
      console.log('main.ts:', response);
    }
  } catch (error: any) {
    console.log(error);
  }
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

    app.on('activate', handleCreateWindow);
    eventListeners.activate = handleCreateWindow;
  })
  .catch(console.error);

export { mainWindow, handleCreateWindow };
