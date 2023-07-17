import { dialog, app } from 'electron';
import { mainWindow } from '../main';
import { configStorage } from '../config';
import createFileWatchers from './FileWatchers';
import processDataRequest from './TodoObjects';
import path from 'path';
import fs from 'fs-extra';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

function getActiveFile(): File | null {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    if (files.length === 0) return null;
    const activeIndex = files.findIndex((file) => file.active);
    return files[activeIndex] || null;
  } catch(error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

async function openFile(): Promise<void> {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      addFile(filePath);
    }
  } catch(error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }  
}

async function createFile(): Promise<void> {
  try {
    const result = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('documents'), 'todo.txt'),
      filters: [{ name: 'Text Files', extensions: ['txt'] }],
    });

    if (!result.canceled && result.filePath) {
      const filePath = result.filePath;

      await fs.writeFile(filePath, '');

      addFile(filePath);
      console.log('File created successfully');
    }
  } catch(error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }      
}

function addFile(filePath: string): void {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    let existingFileIndex = -1;

    if(files && files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
      existingFileIndex = files.findIndex((file) => file.path.includes(filePath));
    }

    if(existingFileIndex === -1) {
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

    configStorage.set('files', files);

    processDataRequest(filePath, '').then(function(response) {
      console.info("New file added: " + response);
    }).catch(function(error) {
      throw "error";
    });

    createFileWatchers(files);

  } catch(error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function deleteFile(event: any, index: number): void {
  try {
    let files: File[] | [] = configStorage.get('files') as File[] | [];
    files.splice(index, 1);
    const activeIndex: number = files.findIndex((file) => file.active);

    if (files.length > 0 && activeIndex === -1) {
      files[0].active = true;
    } else if (activeIndex !== -1) {
      files[activeIndex].active = true;
    } else {
      files = [];
    }

    configStorage.set('files', files);

    processDataRequest(getActiveFile()?.path, '').then(function(response) {
      console.info("File removed: " + response);
    }).catch(function(error) {
      throw "error";
    });

    createFileWatchers(files);

  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

function setActiveFile(event: any, index: number): void {
  try {
    const files: File[] | [] = configStorage.get('files') as File[] | [];

    if (Object.keys(files).length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
    }

    files[index].active = true;

    configStorage.set('files', files);

    processDataRequest(files[index].path, '').then(function(response) {
      console.info(`Active file is set to ${files[index].path}: ` + response);
    }).catch(function(error) {
      throw "error";
    });

  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
}

export {
  setActiveFile,
  deleteFile,
  createFile,
  getActiveFile,
  openFile
}