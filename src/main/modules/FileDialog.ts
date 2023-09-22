import { app, dialog, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { addFile } from './File';

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
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

export {
  createFile,
  openFile
};