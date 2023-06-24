"use strict";

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import Store from 'electron-store';
const configFilePath = path.join(__dirname, '../testData/');
export const store = new Store({ cwd: configFilePath });

import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, activeFile } from './util';
import createFileWatchers from './modules/FileWatchers.ts';
import processTodoTxtObjects from './modules/TodoTxtObjects.ts';

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

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

export let mainWindow = null;

ipcMain.on('requestTodoTxtObjects', async (event, arg) => {
  try {
    if (!store.get('files')) return false;
    const response = await processTodoTxtObjects(activeFile.path);
    event.reply('receiveTodoTxtObjects', response);
  } catch (error) {
    console.error(error);
    mainWindow.webContents.send('displayError', error);
  }
});

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    icon: getAssetPath('icons/512x512.png'),
    webPreferences: {
      nativeWindowOpen: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
    } else {
      console.error('"mainWindow" is not defined');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  try {
    if(!isDebug) new AppUpdater();
  } catch(error) {
    console.error(error)
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    createFileWatchers(store.get('files'));
    app.on('activate', () => {
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);
