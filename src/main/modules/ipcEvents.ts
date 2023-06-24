"use strict";

import { ipcMain } from 'electron';
import { store, mainWindow } from '../main.ts';
import processTodoTxtObjects from './TodoTxtObjects.ts';
import changeCompleteState from './changeTodoTxtObject.ts';
import { activeFile } from '../util';


ipcMain.on('requestTodoTxtObjects', async (event, arg) => {
  try {
    if (!store.get('files')) return false;
    const todoTxtObjects = await processTodoTxtObjects(activeFile.path);
    event.reply('receiveTodoTxtObjects', todoTxtObjects);
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