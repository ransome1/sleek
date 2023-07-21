import { ipcMain, app } from 'electron';
import processDataRequest from './TodoObjects';
import { changeCompleteState } from './TodoObject';
import { writeTodoObjectToFile } from './WriteToFile';
import { configStorage, filterStorage } from '../config';
import { getActiveFile } from './ActiveFile';
import { setFile, deleteFile } from './File';
import { openFile, createFile } from './FileDialog';

function handleDataRequest(event, searchString, filters) {
  if(filters) filterStorage.set('filters', filters)
  processDataRequest(getActiveFile(), searchString).then(function(response) {
    console.log('ipcEvents.ts:', response)
  }).catch(function(error) {
    console.log(error);
  });
}

async function handleWriteTodoToFile(event, id, string, state, remove) {
  if (string === undefined && state !== undefined && id >= 0 && !remove) {
    string = (await changeCompleteState(id, state)).toString();
  }
  writeTodoObjectToFile(id, string, remove).then(function(response) {
    console.log('ipcEvents.ts:', response)
  }).catch(function(error) {
    event.reply('writeTodoToFile', error);
  });    
}

function handleStoreGet (event, val) {
  try {
    event.returnValue = configStorage.get(val);
    console.log(`ipcEvents.ts: Received config value for ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSet (event, key, val) {
  try {
    configStorage.set(key, val);
    console.log(`ipcEvents.ts: Set ${key} to ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function removeEventListeners () {
  ipcMain.off('storeGet', handleStoreGet);
  ipcMain.off('storeSet', handleStoreSet);
  ipcMain.off('setFile', setFile);
  ipcMain.off('deleteFile', deleteFile);
  ipcMain.off('openFile', openFile);
  ipcMain.off('createFile', createFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
}

app.on('before-quit', removeEventListeners);

ipcMain.on('storeGet', handleStoreGet);
ipcMain.on('storeSet', handleStoreSet);
ipcMain.on('setFile', setFile);
ipcMain.on('deleteFile', deleteFile);
ipcMain.on('openFile', openFile);
ipcMain.on('createFile', createFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
