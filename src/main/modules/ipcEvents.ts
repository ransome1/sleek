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
  const activeFile = getActiveFile();
  processDataRequest(activeFile, searchString).then(function(response) {
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
    console.log(error);
  });    
}

function handleRequestFiles(event) {
  try {
    const files = configStorage.get('files');
    event.reply('requestFiles', files);
    console.log(`ipcEvents.ts: Files sent back to renderer`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleStoreGet (event, val) {
  try {
    event.returnValue = configStorage.get(val);
    console.log(`ipcEvents.ts: Received config value for ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleStoreSet (event, key, val) {
  try {
    configStorage.set(key, val);
    console.log(`ipcEvents.ts: Set ${key} to ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
    event.reply('displayErrorFromMainProcess', error);
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
  ipcMain.off('requestFiles', handleRequestFiles);
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
ipcMain.on('requestFiles', handleRequestFiles);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
