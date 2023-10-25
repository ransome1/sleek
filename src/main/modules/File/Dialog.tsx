import { app, dialog, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
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
      securityScopedBookmarks: true,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath: string = result.filePaths[0];
      const securityScopedBookmark: string | null = result.bookmarks?.[0] || null;

      addFile(filePath, securityScopedBookmark);
    }
    return;
  } catch (error: any) {
    console.error('FileDialog.ts:', error);
  }
}

async function changeDoneFilePath(index: number): Promise<void> {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    const currentPath = path.dirname(files[index].todoFilePath);
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: dialogFilters,
      defaultPath: currentPath,
      securityScopedBookmarks: true,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath: string = result.filePaths[0];
      const securityScopedBookmarks: string[] | null = result.bookmarks || null;
      
      if(filePath) files[index].doneFilePath = filePath;
      if(securityScopedBookmarks) files[index].doneFileBookmark = securityScopedBookmarks[0];
      configStorage.set('files', files)
    }
    return;
  } catch (error: any) {
    console.error('FileDialog.ts:', error);
  }
}

async function createFile(): Promise<void> {
  try {
    const result: SaveDialogReturnValue = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), 'todo.txt'),
      filters: dialogFilters,
      securityScopedBookmarks: true,
    });
    if (!result.canceled && result.filePath) {
      const filePath: string = result.filePath;
      
      const securityScopedBookmark: string | null = result.bookmark || null;

      await fs.writeFile(filePath, '');
      addFile(filePath, securityScopedBookmark);
    }
    return;
  } catch (error: any) {
    console.error('FileDialog.ts:', error);
  }
}

export {
  createFile,
  openFile,
  changeDoneFilePath
};
