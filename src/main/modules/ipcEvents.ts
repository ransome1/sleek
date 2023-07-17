import { ipcMain, app } from 'electron';
import processDataRequest from './TodoObjects';
import { changeCompleteState } from './TodoObject';
import { writeTodoObjectToFile } from './WriteToFile';
import { configStorage, filterStorage } from '../config';
import { openFile, createFile, setActiveFile, getActiveFile, deleteFile } from './File';

function handleApplySearchString(event, searchString) {
  try {
    if(!getActiveFile()) return;
    processDataRequest(getActiveFile().path, searchString);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleSelectedFilters(event, filters) {
  try {
    if(!getActiveFile()) return;
    filterStorage.set('filters', filters);
    processDataRequest(getActiveFile().path, '').then(function(response) {
      console.info("Filters have changed: " + response);
    }).catch(function(error) {
      throw "error";
    });
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleDataRequest(event) {
  try {
    if(!getActiveFile()) return;
    processDataRequest(getActiveFile().path, '').then(function(response) {
      event.reply('writeToConsole', response);
    }).catch(function(error) {
      throw "error";
    });    
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

async function handleWriteTodoToFile(event, id, string, state, remove) {
  try {
    if (string === undefined && state !== undefined && id >= 0 && !remove) {
      string = (await changeCompleteState(id, state)).toString();
    }
    const response = await writeTodoObjectToFile(id, string, remove);
    event.reply('writeTodoToFile', response);
  } catch (error) {
    event.reply('writeTodoToFile', error);
  }
}

function handleRequestFiles(event) {
  try {
    const files = configStorage.get('files');
    event.reply('requestFiles', files);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleStoreGet (event, val) {
  try {
    event.returnValue = configStorage.get(val);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function handleStoreSet (event, key, val) {
  try {
    configStorage.set(key, val);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function removeEventListeners () {
  ipcMain.off('storeGet', handleStoreGet);
  ipcMain.off('storeSet', handleStoreSet);
  ipcMain.off('setFile', setActiveFile);
  ipcMain.off('deleteFile', deleteFile);
  ipcMain.off('openFile', openFile);
  ipcMain.off('createFile', createFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('requestFiles', handleRequestFiles);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('selectedFilters', handleSelectedFilters);
  ipcMain.off('applySearchString', handleApplySearchString);
}

app.on('before-quit', removeEventListeners);

ipcMain.on('storeGet', handleStoreGet);
ipcMain.on('storeSet', handleStoreSet);
ipcMain.on('setFile', setActiveFile);
ipcMain.on('deleteFile', deleteFile);
ipcMain.on('openFile', openFile);
ipcMain.on('createFile', createFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('requestFiles', handleRequestFiles);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('selectedFilters', handleSelectedFilters);
ipcMain.on('applySearchString', handleApplySearchString);
