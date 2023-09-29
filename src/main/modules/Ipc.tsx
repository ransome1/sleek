import { ipcMain, app, IpcMainEvent, clipboard } from 'electron';
import processDataRequest from './ProcessDataRequest';
import { changeCompleteState } from './TodoObject/ChangeCompleteState';
import { writeTodoObjectToFile } from './File/Write';
import archiveTodos from './File/Archive';
import { configStorage, filterStorage } from '../config';
import { addFile, setFile, removeFile, revealFile } from './File/File';
import { openFile, createFile, changeDoneFilePath } from './File/Dialog';

async function handleDataRequest(event: IpcMainEvent, searchString: string): void {
  const [todoObjects, attributes, headers, filters] = await processDataRequest(searchString);
  event.reply('requestData', todoObjects, attributes, headers, filters);
}

async function handleWriteTodoToFile(event: IpcMainEvent, id: number, string: string, state: boolean | undefined, remove: boolean): Promise<void> {
  try {
    let updatedString: string = string;
    if (state !== undefined && id >= 0 && !remove) {
      updatedString = await changeCompleteState(string, state);
    }
    writeTodoObjectToFile(id, updatedString, remove).then(function (response) {
      console.log('ipcEvents.ts:', response);
      event.reply('writeTodoToFile', response);
    }).catch((error) => {
      event.reply('writeTodoToFile', error);
    });
  } catch (error) {
    console.error(error);
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = configStorage.get(value);
    console.log(`ipcEvents.ts: Received config value for ${value}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any): void {
  try {
    if(!key) return false;
    configStorage.set(key, value);
    console.log(`ipcEvents.ts: Set ${key} to ${value}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSetFilters(event: IpcMainEvent, value: any): void {
  try {
    filterStorage.set('filters', value);
    console.log(`ipcEvents.ts: Filters saved`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    if (clipboard.readText() === string) {
      event.reply('saveToClipboard', 'Text copied to clipboard: ' + string);
    } else {
      throw('Failed to copy text to clipboard');
    }
  } catch (error) {
    event.reply('saveToClipboard', error);
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGetConfig', handleStoreGetConfig);
  ipcMain.off('storeSetConfig', handleStoreSetConfig);
  ipcMain.off('storeSetFilters', handleStoreSetFilters);
  ipcMain.off('setFile', setFile);
  ipcMain.off('removeFile', removeFile);
  ipcMain.off('openFile', openFile);
  ipcMain.off('createFile', createFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('archiveTodos', archiveTodos);
  ipcMain.off('addFile', addFile);
  ipcMain.off('saveToClipboard', handleSaveToClipboard);
  ipcMain.off('revealFile', revealFile);
  ipcMain.off('changeDoneFilePath', changeDoneFilePath);
}

app.on('before-quit', removeEventListeners);

ipcMain.on('storeGetConfig', handleStoreGetConfig);
ipcMain.on('storeSetConfig', handleStoreSetConfig);
ipcMain.on('storeSetFilters', handleStoreSetFilters);
ipcMain.on('setFile', setFile);
ipcMain.on('removeFile', removeFile);
ipcMain.on('openFile', openFile);
ipcMain.on('createFile', createFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('archiveTodos', archiveTodos);
ipcMain.on('addFile', addFile);
ipcMain.on('saveToClipboard', handleSaveToClipboard);
ipcMain.on('revealFile', revealFile);
ipcMain.on('changeDoneFilePath', changeDoneFilePath);