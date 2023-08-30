import { ipcMain, app, IpcMainEvent } from 'electron';
import processDataRequest from './ProcessDataRequest';
import { changeCompleteState } from './ChangeCompleteState';
import { writeTodoObjectToFile } from './WriteToFile';
import archiveTodos from './ArchiveTodos';
import { configStorage, filterStorage } from '../config';
import { setFile, removeFile } from './File';
import { openFile, createFile } from './FileDialog';

async function handleDataRequest(event: IpcMainEvent, searchString: string): void {
  const [todoObjects, attributes, headers, filters] = await processDataRequest();
  event.reply('requestData', todoObjects, attributes, headers, filters);
}

async function handleWriteTodoToFile(event: IpcMainEvent, id: number, string: string, state: boolean | undefined, remove: boolean): Promise<void> {
  try {
    let updatedString: string = string;

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

function handleStoreGet(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = configStorage.get(value);
    console.log(`ipcEvents.ts: Received config value for ${value}`);
  } catch (error) {
    console.error('ipcEvents.ts:', error);
  }
}

function handleStoreSet(event: IpcMainEvent, key: string, value: any): void {
  try {
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