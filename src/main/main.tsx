import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { configStorage } from './config';
import { createMenu } from './modules/Menu';
import handleTheme from './modules/Theme';
import { getAssetPath, resolveHtmlPath } from './util';
import { createFileWatcher, watcher } from './modules/File/Watcher';
import { createTray } from './modules/Tray';
import './modules/Ipc';

const environment: string | undefined = process.env.NODE_ENV;
const files: FileObject[] = (configStorage.get('files') as FileObject[]) || [];
let tray: boolean = configStorage.get('tray');
let mainWindow: BrowserWindow | null = null;
let eventListeners: Record<string, any> = {};

const handleCreateWindow = () => {
  if(mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
}

const handleClosed = async () => {
  if(watcher) await watcher.close();

  mainWindow = null;

  delete eventListeners.handleReadyToShow;
  delete eventListeners.handleClosed;
  delete eventListeners.handleResize;
  delete eventListeners.handleMove;
  delete eventListeners.handleShow;
  delete eventListeners.handleMaximize;
  delete eventListeners.handleUnmaximize;
  delete eventListeners.handleCreateWindow;
  delete eventListeners.handleWindowAllClosed;
  delete eventListeners.handleWillQuit;
  delete eventListeners.handleBeforeQuit;
  delete eventListeners.watcher;
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

const createWindow = () => {
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
      if(!error) {
        mainWindow?.webContents.insertCSS(data);
        console.error('Styles injected found in CSS file:', customStylesPath);
      } else {
        console.error('Error reading the CSS file:', error);
      }
    });
  }

  handleWindowSizeAndPosition();

  handleTheme();

  mainWindow?.loadURL(resolveHtmlPath('index.html'));
  mainWindow
    .on('ready-to-show', handleReadyToShow)
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('show', handleShow)
    .on('closed', handleClosed)
    .on('maximize', handleMaximize)
    .on('unmaximize', handleUnmaximize);

  eventListeners
    .handleReadyToShow = handleReadyToShow
    .handleClosed = handleClosed
    .handleResize = handleResize
    .handleMove = handleMove
    .handleShow = handleShow
    .handleMaximize = handleMaximize
    .handleUnmaximize = handleUnmaximize;
}

const handleReadyToShow = async () => {
  if(files && Object.keys(files)?.length > 0) {
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

app
  .on('window-all-closed', handleWindowAllClosed)
  .on('before-quit', handleBeforeQuit)
  .on('activate', handleCreateWindow)
  .whenReady()
  .then(() => {

    createWindow();

    createMenu(files);

    if(tray) {
      createTray();
    }

    eventListeners
      .handleCreateWindow = handleCreateWindow
      .handleWindowAllClosed = handleWindowAllClosed
      .handleBeforeQuit = handleBeforeQuit;

  })
  .catch(console.error);

export { mainWindow, handleCreateWindow, eventListeners };
