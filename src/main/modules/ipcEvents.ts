"use strict";

import { ipcMain } from 'electron';
import { store, mainWindow } from '../main.ts';
import processTodoTxtObjects from './TodoTxtObjects.ts';
import changeCompleteState from './TodoTxtObject.ts';
import { activeFile } from '../util';

ipcMain.on('setActiveFile', async (event, arg) => {
  try {
    const files = store.get('files');
    files.map((file, index) => {
      file.active = 0;
    });
    files[arg].active = 1
    store.set('files', files)
    console.log(`Active file is set to ${files[arg].path}`)
    processTodoTxtObjects(files[arg].path);
  } catch (error) {
    console.error(error);
    mainWindow.webContents.send('displayError', error);
  }
});

ipcMain.on('requestTodoTxtObjects', async (event, arg) => {
  try {
    processTodoTxtObjects(activeFile().path);
  } catch (error) {
    console.error(error);
    mainWindow.webContents.send('displayError', error);
  }
});

ipcMain.on('requestFiles', async (event, arg) => {
  try {
    if (!store) return false;
    const files = await store.get('files');
    event.reply('receiveFiles', files);
  } catch (error) {
    console.error(error);
    mainWindow.webContents.send('displayError', error);
  }
});

ipcMain.on('changeCompleteState', async (event, id, state) => {
  try {
    changeCompleteState(id, state);
  } catch (error) {
    console.error(error);
    mainWindow.webContents.send('displayError', error);
  }
});