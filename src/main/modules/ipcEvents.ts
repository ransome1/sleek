import { ipcMain, app, IpcMainEvent } from 'electron';
import { mainWindow } from '../main';
import processDataRequest from './todoObjects';
import { changeCompleteState } from './TodoObject';
import { writeTodoObjectToFile } from './WriteToFile';
import { activeFile } from '../util';
import store from '../config';

interface File {
  path: string;
  active: boolean;
}

const handleSetActiveFile = async (event: IpcMainEvent, arg: number): Promise<void> => {
  try {
    const files: File[] = (store.get('files') as File[]) || [];
    
    files.forEach((file: File) => {
      file.active = false;
    });
    
    files[arg].active = true;
    store.set('files', files);
    
    console.log(`Active file is set to ${files[arg].path}`);
    
    await processDataRequest(files[arg].path);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleApplySearchString = async (event: IpcMainEvent, arg: string): Promise<void> => {
  try {
    const activeFilePath = activeFile()?.path || '';
    processDataRequest(activeFilePath, arg)
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleDataRequest = async (event: IpcMainEvent): Promise<void> => {
  try {
    const activeFilePath = activeFile()?.path || '';
    const response = await processDataRequest(activeFilePath);
    event.reply('writeToConsole', response);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleWriteTodoToFile = async (event: IpcMainEvent, id: number, string: string): Promise<void> => {
  try {
    const response = await writeTodoObjectToFile(id, string);
    event.reply('successWritingToFile', response);
  } catch (error) {
    event.reply('errorWritingToFile', error);
  }
};

const handleRequestFiles = (event: IpcMainEvent): void => {
  try {
    const files = store.get('files');
    event.reply('receiveFiles', files);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};

const handleChangeCompleteState = async (event: IpcMainEvent, id: number, state: boolean): Promise<void> => {
  try {
    const updatedTodoObject = await changeCompleteState(id, state);
    
    if (updatedTodoObject === null) {
      event.reply('displayErrorFromMainProcess', updatedTodoObject);
      return;
    }

    const response = await writeTodoObjectToFile(id, updatedTodoObject.toString());
    event.reply('writeToConsole', response);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};


ipcMain.on('setActiveFile', handleSetActiveFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('requestFiles', handleRequestFiles);
ipcMain.on('changeCompleteState', handleChangeCompleteState);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('applySearchString', handleApplySearchString);

const removeEventListeners = (): void => {
  ipcMain.off('setActiveFile', handleSetActiveFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('requestFiles', handleRequestFiles);
  ipcMain.off('changeCompleteState', handleChangeCompleteState);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('applySearchString', handleApplySearchString);
};

app.on('before-quit', removeEventListeners);
