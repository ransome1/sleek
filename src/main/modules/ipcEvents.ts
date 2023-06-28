import { ipcMain, app, IpcMainEvent } from 'electron';
import { mainWindow } from '../main';
import processTodoTxtObjects from './TodoTxtObjects';
import { changeCompleteState } from './TodoTxtObject';
import { activeFile } from '../util';
import store from '../config';

const eventListeners: (() => void)[] = [];

interface File {
  path: string;
  active: boolean;
}

const handleSetActiveFile = async (event: IpcMainEvent, arg: number): Promise<void> => {
  try {
    const files: File[] = store.get('files') as File[] || [];
    
    files.forEach((file: File) => {
      file.active = false;
    });
    
    files[arg].active = true;
    store.set('files', files);
    
    console.log(`Active file is set to ${files[arg].path}`);
    
    await processTodoTxtObjects(files[arg].path);
  } catch (error) {
    console.error(error);
    mainWindow?.webContents.send('displayErrorFromMainProcess', error);
  }
};
const handleRequestTodoTxtObjects = async (event: IpcMainEvent) => {
  try {
    const activeFilePath = activeFile()?.path || '';
    await processTodoTxtObjects(activeFilePath);
  } catch (error) {
    console.error(error);
    mainWindow?.webContents.send('displayErrorFromMainProcess', error);
  }
};

const handleRequestFiles = (event: IpcMainEvent) => {
  try {
    const files = store.get('files');
    event.reply('receiveFiles', files);
  } catch (error) {
    console.error(error);
    mainWindow?.webContents.send('displayErrorFromMainProcess', error);
  }
};

const handleChangeCompleteState = (event: IpcMainEvent, id: number, state: boolean) => {
  try {
    changeCompleteState(id, state);
  } catch (error) {
    console.error(error);
    mainWindow?.webContents.send('displayErrorFromMainProcess', error);
  }
};

ipcMain.on('setActiveFile', handleSetActiveFile);
ipcMain.on('requestTodoTxtObjects', handleRequestTodoTxtObjects);
ipcMain.on('requestFiles', handleRequestFiles);
ipcMain.on('changeCompleteState', handleChangeCompleteState);

eventListeners.push(
  () => ipcMain.off('setActiveFile', handleSetActiveFile),
  () => ipcMain.off('requestTodoTxtObjects', handleRequestTodoTxtObjects),
  () => ipcMain.off('requestFiles', handleRequestFiles),
  () => ipcMain.off('changeCompleteState', handleChangeCompleteState)
);

const removeEventListeners = () => {
  eventListeners.forEach(listener => listener());
  eventListeners.length = 0;
};

//app.on('before-quit', removeEventListeners);
