import { ipcMain, app } from 'electron';
import processDataRequest from './TodoObjects';
import { changeCompleteState } from './TodoObject';
import { writeTodoObjectToFile } from './WriteToFile';
import { configStorage, filterStorage } from '../config';
import { openFile, createFile, setActiveFile } from './File';
import createFileWatchers from './Filewatchers';

export const handleUpdateConfig = (event, args) => {
  try {
    if (args !== undefined && args[1] !== undefined) {
      configStorage.set(args[0], args[1]);
    }
    const config = configStorage.get();
    event.reply('updateConfig', config);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleApplySearchString = (event, arg) => {
  try {
    processDataRequest(configStorage.get('activeFile'), arg);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleSelectedFilters = (event, filters) => {
  try {
    filterStorage.set('filters', filters);
    processDataRequest(configStorage.get('activeFile'));
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleDataRequest = async (event) => {
  try {
    const response = await processDataRequest(configStorage.get('activeFile'));
    event.reply('writeToConsole', response);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleWriteTodoToFile = async (event, id, string, state) => {
  try {
    if (string === undefined && state !== undefined && id >= 0) {
      string = (await changeCompleteState(id, state)).toString();
    }
    const response = await writeTodoObjectToFile(id, string);
    event.reply('writeTodoToFile', response);
  } catch (error) {
    event.reply('writeTodoToFile', error);
  }
};

const handleRequestFiles = (event) => {
  try {
    const files = configStorage.get('files');
    event.reply('requestFiles', files);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const removeEventListeners = () => {
  ipcMain.off('setFile', setActiveFile);
  ipcMain.off('openFile', openFile);
  ipcMain.off('createFile', createFile);
  ipcMain.off('updateConfig', handleUpdateConfig);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('requestFiles', handleRequestFiles);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('selectedFilters', handleSelectedFilters);
  ipcMain.off('applySearchString', handleApplySearchString);
};

app.on('before-quit', removeEventListeners);

ipcMain.on('setFile', setActiveFile);
ipcMain.on('openFile', openFile);
ipcMain.on('createFile', createFile);
ipcMain.on('updateConfig', handleUpdateConfig);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('requestFiles', handleRequestFiles);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('selectedFilters', handleSelectedFilters);
ipcMain.on('applySearchString', handleApplySearchString);
