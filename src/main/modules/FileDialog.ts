import { app, dialog, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { addFile } from './File';

async function openFile(): Promise<void> {
  try {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath: string = result.filePaths[0];
      addFile(filePath);
    }
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

async function createFile(): Promise<void> {
  try {
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), 'todo.txt'),
      filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });

    if (!result.canceled && result.filePath) {
      const filePath: string = result.filePath;

      await fs.writeFile(filePath, '');

      addFile(filePath);
    }
  } catch (error) {
    console.error('FileDialog.ts:', error);
  }
}

export {
  createFile,
  openFile
};
