import { configStorage } from '../config';
import createFileWatcher from './FileWatcher';
import buildMenu from '../menu';
import { mainWindow } from '../main';
import path from 'path';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

async function addFile(filePath: string): Promise<void> {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    let existingFileIndex = -1;

    if (files && files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
      existingFileIndex = files.findIndex((file) => file.path.includes(filePath));
    }

    if (existingFileIndex === -1) {
      files.push({
        active: true,
        path: filePath,
        filename: path.basename(filePath),
      });
    } else {
      if (existingFileIndex !== -1) {
        files[existingFileIndex].active = true;
      }
    }

    buildMenu(files);

    configStorage.set('files', files);
    mainWindow.send('updateFiles', files);

    createFileWatcher(files).then(function(response) {
      console.info('File.ts: File added, restarting file watchers');
    }).catch((error) => {
      throw error;
    });
    
  } catch (error) {
    console.error('File.ts:', error);
  }
}

async function removeFile(event: any, index: number): Promise<void> {
  try {
    let files: File[] = configStorage.get('files') as File[];

    files.splice(index, 1);
    const activeIndex: number = files.findIndex((file) => file.active);

    if (files.length > 0 && activeIndex === -1) {
      files[0].active = true;
    } else if (activeIndex !== -1) {
      files[activeIndex].active = true;
    } else {
      files = [];
    }

    buildMenu(files);

    configStorage.set('files', files);
    mainWindow.send('updateFiles', files);

    createFileWatcher(files).then(function(response) {
      console.info('File.ts: File deleted, restarting file watchers');
    }).catch((error) => {
      throw error;
    });

  } catch (error) {
    console.error('File.ts:', error);
  }
}

function setFile(event: any, index: number): void {
  try {
    const files: File[] = configStorage.get('files') as File[];

    if (files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
    }

    files[index].active = true;

    configStorage.set('files', files);
    mainWindow.send('updateFiles', files);

  } catch (error) {
    console.error('File.ts:', error);
  }
}

export { setFile, removeFile, addFile };
