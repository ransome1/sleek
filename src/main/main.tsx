import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import fs from 'fs';
import { configStorage } from './config';
import { createMenu } from './modules/Menu';
import { getAssetPath, resolveHtmlPath } from './util';
import { createFileWatcher, watcher } from './modules/File/Watcher';
import { addFile } from './modules/File/File';
import { createTray } from './modules/Tray';
import './modules/Ipc';

const environment: string | undefined = process.env.NODE_ENV;
const files: FileObject[] = (configStorage.get('files') as FileObject[]) || [];
let tray: boolean = configStorage.get('tray');
const colorTheme = configStorage.get('colorTheme');
let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any | undefined> = {};

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

  eventListeners.handleReadyToShow = undefined;
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
  const rectangle = mainWindow?.getBounds() as WindowRectangle;
  const width = rectangle.width;
  const height = rectangle.height;
  configStorage.set('windowDimensions', { width, height });
  configStorage.set('windowMaximized', false);
}

const handleMove = () => {
  const rectangle = mainWindow?.getBounds() as WindowRectangle;
  const x = rectangle.x;
  const y = rectangle.y;
  configStorage.set('windowPosition', { x, y });
  configStorage.set('windowMaximized', false);
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
    return;
  }

  const windowDimensions: { width: number; height: number } | null = configStorage.get('windowDimensions') as { width: number; height: number } | null;

  if(windowDimensions) {
    const { width, height } = windowDimensions;
    mainWindow?.setSize(width, height);

    const windowPosition: { x: number; y: number } | null = configStorage.get('windowPosition') as { x: number; y: number } | null;
    if(windowPosition) {
      const { x, y } = windowPosition;
      mainWindow?.setPosition(x, y);
    }
  }
}

const createMainWindow = () => {
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

  if (environment === 'development') {
    mainWindow.webContents.openDevTools();
  }

  handleWindowSizeAndPosition();  

  nativeTheme.themeSource = colorTheme;

  mainWindow?.loadURL(resolveHtmlPath('index.html'));

  mainWindow
    .on('ready-to-show', handleReadyToShow)
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('show', handleShow)
    .on('closed', handleClosed)
    .on('maximize', handleMaximize)
    .on('unmaximize', handleUnmaximize);

  eventListeners.handleReadyToShow = handleReadyToShow
  eventListeners.handleClosed = handleClosed
  eventListeners.handleResize = handleResize
  eventListeners.handleMove = handleMove
  eventListeners.handleShow = handleShow
  eventListeners.handleMaximize = handleMaximize
  eventListeners.handleUnmaximize = handleUnmaximize;

  const customStylesPath: string = configStorage.get('customStylesPath');
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

const handleReadyToShow = async () => {
  if(files?.length > 0) {
    createFileWatcher(files);
  }
}

const handleWindowAllClosed = () => {
  tray = configStorage.get('tray');
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

const handleOpenFile = (path: string) => {
  if(path) addFile(path, null);
};

app
  .on('window-all-closed', handleWindowAllClosed)
  .on('before-quit', handleBeforeQuit)
  .on('activate', handleCreateWindow)
  .on('open-file', () => handleOpenFile(path))
  .whenReady()
  .then(() => {

    createMainWindow();

    createMenu(files);

    if(tray) {
      createTray();
    }

    eventListeners.handleCreateWindow = handleCreateWindow
    eventListeners.handleWindowAllClosed = handleWindowAllClosed
    eventListeners.handleBeforeQuit = handleBeforeQuit;

  })
  .catch(console.error);

export { mainWindow, handleCreateWindow, eventListeners };
