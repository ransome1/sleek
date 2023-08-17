import { ipcMain, app, IpcMainEvent } from 'electron';
import { Item } from 'jstodotxt';
import processDataRequest from './ProcessDataRequest';
import { changeCompleteState } from './ChangeCompleteState';
import { writeTodoObjectToFile } from './WriteToFile';
import archiveTodos from './ArchiveTodos';
import { configStorage, filterStorage } from '../config';
import { setFile, removeFile } from './File';
import { openFile, createFile } from './FileDialog';

function handleDataRequest(event: IpcMainEvent, searchString: string): void {
  processDataRequest(searchString)
    .then(([sortedTodoObjects, attributes, headers, filters]) => {
      event.reply('requestData', sortedTodoObjects, attributes, headers, filters);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function handleWriteTodoToFile(
  event: IpcMainEvent,
  id: number,
  string: string,
  state: boolean | undefined,
  remove: boolean
): Promise<void> {
  try {
    let updatedString = string;

    if (state !== undefined && id >= 0 && !remove) {
      updatedString = await changeCompleteState(string, state);
    }

    writeTodoObjectToFile(id, updatedString, remove)
      .then(function (response) {
        console.log('ipcEvents.ts:', response);
      })
      .catch((error) => {
        event.reply('writeTodoToFile', error);
      });
  } catch (error) {
    console.error(error);
  }
}

function handleStoreGet(event: IpcMainEvent, val: string): void {
  try {
    event.returnValue = configStorage.get(val);
    console.log(`ipcEvents.ts: Received config value for ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSet(event: IpcMainEvent, key: string, val: any): void {
  try {
    configStorage.set(key, val);
    console.log(`ipcEvents.ts: Set ${key} to ${val}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSetFilters(event: IpcMainEvent, val: any): void {
  try {
    filterStorage.set('filters', val);
    console.log(`ipcEvents.ts: Filters saved`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGet', handleStoreGet);
  ipcMain.off('storeSet', handleStoreSet);
  ipcMain.off('storeSetFilters', handleStoreSetFilters);
  ipcMain.off('setFile', setFile);
  ipcMain.off('removeFile', removeFile);
  ipcMain.off('openFile', openFile);
  ipcMain.off('createFile', createFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('archiveTodos', archiveTodos);
}

app.on('before-quit', removeEventListeners);

ipcMain.on('storeGet', handleStoreGet);
ipcMain.on('storeSet', handleStoreSet);
ipcMain.on('storeSetFilters', handleStoreSetFilters);
ipcMain.on('setFile', setFile);
ipcMain.on('removeFile', removeFile);
ipcMain.on('openFile', openFile);
ipcMain.on('createFile', createFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('archiveTodos', archiveTodos);