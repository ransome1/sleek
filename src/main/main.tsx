import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { createMenu } from './modules/Menu';
import { getAssetPath, resolveHtmlPath } from './util';
import { createFileWatcher, watcher } from './modules/File/Watcher';
import { createTray } from './modules/Tray';
import './modules/IpcMain';

const environment: string | undefined = process.env.NODE_ENV;
let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any | undefined> = {};
let resizeTimeout: NodeJS.Timeout | undefined;

const handleCreateWindow = () => {
  if(mainWindow) {
    mainWindow.show();
  } else {
    createMainWindow();
  }
}

const handleClosed = async () => {
  if(watcher) await watcher.close();
  mainWindow = null;
  eventListeners.handleClosed = undefined;
  eventListeners.handleResize = undefined;
  eventListeners.handleMove = undefined;
  eventListeners.handleShow = undefined;
  eventListeners.handleMaximize = undefined;
  eventListeners.handleUnmaximize = undefined;
  eventListeners.handleCreateWindow = undefined;
  eventListeners.handleWindowAllClosed = undefined;
  eventListeners.handleWillQuit = undefined;
  eventListeners.handleBeforeQuit = undefined;
  eventListeners.watcher = undefined;
}

const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const rectangle = mainWindow?.getBounds() as WindowRectangle;
    const width = rectangle.width;
    const height = rectangle.height;
    config.set('windowDimensions', { width, height });
    config.set('windowMaximized', false);
  }, 500);
}

const handleMove = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const rectangle = mainWindow?.getBounds() as WindowRectangle;
    const x = rectangle.x;
    const y = rectangle.y;
    config.set('windowPosition', { x, y });
    config.set('windowMaximized', false);
  }, 500);
}

const handleUnmaximize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    config.set('windowMaximized', false);
  }, 500);
}

const handleMaximize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    config.set('windowMaximized', true)
  }, 500);
}

const handleShow = () => {
  app.dock?.show();
}

const handleWindowSizeAndPosition = () => {
  const isMaximized = config.get('windowMaximized');
  if(isMaximized) {
    mainWindow?.maximize();
    return;
  }

  const windowDimensions: { width: number; height: number } | null = config.get('windowDimensions') as { width: number; height: number } | null;

  if(windowDimensions) {
    const { width, height } = windowDimensions;
    mainWindow?.setSize(width, height);

    const windowPosition: { x: number; y: number } | null = config.get('windowPosition') as { x: number; y: number } | null;
    if(windowPosition) {
      const { x, y } = windowPosition;
      mainWindow?.setPosition(x, y);
    }
  }
}

const createMainWindow = () => {
  const shouldUseDarkColors: boolean = config.get('shouldUseDarkColors');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    backgroundColor: (shouldUseDarkColors) ? '#212224' : '#fff',
    icon: process.platform === 'win32'
    ? getAssetPath('icons/sleek.ico')
    : process.platform === 'darwin'
    ? getAssetPath('icons/sleek.icns')
    : getAssetPath('icons/512x512.png'),
    webPreferences: {
      spellcheck: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: environment === 'production'
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.ts'),
    },
  });

  mainWindow?.loadURL(resolveHtmlPath('index.html'));

  const files: FileObject[] = (config.get('files') as FileObject[]) || [];
  if(files) {
    createFileWatcher(files);  
  }
  createMenu(files);

  handleWindowSizeAndPosition();  

  nativeTheme.themeSource = config.get('colorTheme');

  mainWindow
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('show', handleShow)
    .on('closed', handleClosed)
    .on('maximize', handleMaximize)
    .on('unmaximize', handleUnmaximize);

  eventListeners.handleClosed = handleClosed
  eventListeners.handleResize = handleResize
  eventListeners.handleMove = handleMove
  eventListeners.handleShow = handleShow
  eventListeners.handleMaximize = handleMaximize
  eventListeners.handleUnmaximize = handleUnmaximize;

  if(config.get('tray')) {
    createTray();
  }

  if (environment === 'development') {
    mainWindow.webContents.openDevTools();
  }

  const customStylesPath: string = config.get('customStylesPath');
  if(customStylesPath) {
    fs.readFile(customStylesPath, 'utf8', (error: Error | null, data) => {
      if(!error) {
        mainWindow?.webContents.insertCSS(data);
        console.error('Styles injected found in CSS file:', customStylesPath);
      } else {
        console.error('Error reading the CSS file:', error);
      }
    });
  }
}

const handleWindowAllClosed = () => {
  const tray = config.get('tray');
  if(process.platform !== 'darwin' && !tray) {
    app.quit();
  } else if(process.platform === 'darwin' && tray) {
    app.dock?.hide();
  } else {
    mainWindow?.hide();
  }
}

const handleBeforeQuit = () => {
  app.releaseSingleInstanceLock();
}

// const handleOpenFile = (path) => {
//   console.log(typeof path)
//   if(path) addFile(path, null);
// };

app
  .whenReady().then(() => {
    createMainWindow();
    eventListeners.handleCreateWindow = handleCreateWindow;
    eventListeners.handleWindowAllClosed = handleWindowAllClosed;
    eventListeners.handleBeforeQuit = handleBeforeQuit;
    //eventListeners.handleOpenFile = handleOpenFile;
  })
  .catch(console.error);

app
  .on('window-all-closed', handleWindowAllClosed)
  .on('before-quit', handleBeforeQuit)
  .on('activate', handleCreateWindow);
  //.on('open-file', () => handleOpenFile(path));

export { mainWindow, handleCreateWindow, eventListeners };
