import { app, dialog, OpenDialogReturnValue, SaveDialogReturnValue, IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { configStorage } from '../../config';
import { addFile } from './File';
import { File } from '../../util';

const dialogFilters = [
  {
    name: 'Text files',
    extensions: ['txt']
  },
  {
    name: 'All files',
    extensions: ['*']
  }  
]

async function openFile(): Promise<void> {
  try {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: dialogFilters,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath: string = result.filePaths[0];
      addFile(null, filePath);
    }
    return;
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

async function changeDoneFilePath(event: IpcMainEvent, index: number): Promise<void> {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    const currentPath = path.dirname(files[index].todoFilePath);
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: dialogFilters,
      defaultPath: currentPath,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath: string = result.filePaths[0];
      if(filePath) files[index].doneFilePath = filePath;
      configStorage.set('files', files)
    }
    return;
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

async function createFile(): Promise<void> {
  try { 
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), 'todo.txt'),
      filters: dialogFilters,
    });
    if (!result.canceled && result.filePath) {
      const filePath: string = result.filePath;
      await fs.writeFile(filePath, '');
      addFile(null, filePath);
    }
    return;
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

export {
  createFile,
  openFile,
  changeDoneFilePath
};