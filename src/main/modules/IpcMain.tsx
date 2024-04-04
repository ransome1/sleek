import { ipcMain, app, IpcMainEvent, clipboard, shell } from 'electron';
import { dataRequest } from './DataRequest/DataRequest';
import { changeCompleteState } from './DataRequest/ChangeCompleteState';
import { prepareContentForWriting, removeLineFromFile } from './File/Write';
import { archiveTodos, handleRequestArchive } from './File/Archive';
import { config, filter, notifiedTodoObjectsStorage } from '../config';
import { handleError } from '../util';
import { addFile, setFile, removeFile } from './File/File';
import { openFile, createFile } from './File/Dialog';
import { createTodoObject } from './DataRequest/CreateTodoObjects';

function handleDataRequest(event: IpcMainEvent, searchString: string) {
  try {
    const requestedData = dataRequest(searchString);
    event.reply('requestData', requestedData);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleUpdateAttributeFields(event: IpcMainEvent, index: number, string: string) {
  try {
    const todoObject = createTodoObject(index, string);
    event.reply('updateAttributeFields', todoObject);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleUpdateTodoObject(event: IpcMainEvent, index: number, string: string, attributeType: string, attributeValue: string) {
 try {
    const todoObject = createTodoObject(index, string, attributeType, attributeValue);
    event.reply('updateTodoObject', todoObject);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleWriteTodoToFile(event: IpcMainEvent, index: number, string: string, state: boolean, attributeType: string, attributeValue: string) {
  try {
    if(attributeType && attributeValue) {
      const todoObject = createTodoObject(index, string, attributeType, attributeValue);
      prepareContentForWriting(index, todoObject.string);
    } else {
      let updatedString: string | null = string;
      if(state !== undefined && index >= 0) updatedString = changeCompleteState(string, state)
      prepareContentForWriting(index, updatedString);
    }
  } catch(error: Error) {
    handleError(error);
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = config.get(value);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any) {
  try {
    config.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleStoreSetFilters(event: IpcMainEvent, key: string, value: any): void {
  try {
    filter.set(key, value);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = filter.get(value);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleStoreSetNotifiedTodoObjects(event: IpcMainEvent, value: any): void {
  try {
    notifiedTodoObjectsStorage.set('notifiedTodoObjects', value);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    setFile(index);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleAddFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleDroppedFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleRevealInFileManager(event: IpcMainEvent, pathToReveal: string): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch(error: Error) {
    handleError(error);
  }
}

async function handleOpenFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    openFile(setDoneFile);
  } catch(error: Error) {
    handleError(error);
  }
}

async function handleCreateFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    await createFile(setDoneFile);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleRemoveLineFromFile(event: IpcMainEvent, index: number) {
  try {
    removeLineFromFile(index);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleArchiveTodos(event: IpcMainEvent): Promise<void> {
  try {
    const archivingResult = archiveTodos();
    event.reply('responseFromMainProcess', archivingResult);
  } catch(error: Error) {
    handleError(error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    event.reply('responseFromMainProcess', 'Copied to clipboard: ' + string);
  } catch(error: Error) {
    handleError(error);
  }
}

async function handleOpenInBrowser(event: IpcMainEvent, url: string): Promise<void> {
  try {
    await shell?.openExternal(url);
  } catch(error: Error) {
    handleError(error);
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGetConfig', handleStoreGetConfig);
  ipcMain.off('storeSetConfig', handleStoreSetConfig);
  ipcMain.off('storeSetFilters', handleStoreSetFilters);
  ipcMain.off('storeGetFilters', handleStoreGetFilters);
  ipcMain.off('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
  ipcMain.off('setFile', handleSetFile);
  ipcMain.off('removeFile', handleRemoveFile);
  ipcMain.off('openFile', handleOpenFile);
  ipcMain.off('createFile', handleCreateFile);
  ipcMain.off('updateAttributeFields', handleUpdateAttributeFields);
  ipcMain.off('openInBrowser', handleOpenInBrowser);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('archiveTodos', handleArchiveTodos);
  ipcMain.off('addFile', handleAddFile);
  ipcMain.off('droppedFile', handleDroppedFile);
  ipcMain.off('saveToClipboard', handleSaveToClipboard);
  ipcMain.off('revealInFileManager', handleRevealInFileManager);
  ipcMain.off('removeLineFromFile', handleRemoveLineFromFile);
  ipcMain.off('updateTodoObject', handleUpdateTodoObject);
  ipcMain.off('requestArchive', handleRequestArchive);
}

app.on('before-quit', () => removeEventListeners);

ipcMain.on('storeGetConfig', handleStoreGetConfig);
ipcMain.on('storeSetConfig', handleStoreSetConfig);
ipcMain.on('storeSetFilters', handleStoreSetFilters);
ipcMain.on('storeGetFilters', handleStoreGetFilters);
ipcMain.on('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
ipcMain.on('setFile', handleSetFile);
ipcMain.on('removeFile', handleRemoveFile);
ipcMain.on('openFile', handleOpenFile);
ipcMain.on('createFile', handleCreateFile);
ipcMain.on('updateAttributeFields', handleUpdateAttributeFields);
ipcMain.on('openInBrowser', handleOpenInBrowser);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('archiveTodos', handleArchiveTodos);
ipcMain.on('addFile', handleAddFile);
ipcMain.on('droppedFile', handleDroppedFile);
ipcMain.on('saveToClipboard', handleSaveToClipboard);
ipcMain.on('revealInFileManager', handleRevealInFileManager);
ipcMain.on('removeLineFromFile', handleRemoveLineFromFile);
ipcMain.on('updateTodoObject', handleUpdateTodoObject);
ipcMain.on('requestArchive', handleRequestArchive);