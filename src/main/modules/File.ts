import { dialog, app } from 'electron';
import { mainWindow } from '../main';
import { configStorage } from '../config';
import createFileWatchers from './FileWatchers';
import processDataRequest from './TodoObjects';
import path from 'path';
import fs from 'fs-extra';

export async function openFile() {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    updateFiles(filePath);
  }
}

export async function createFile() {
  const result = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath('documents'), 'todo.txt'),
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });

  if (!result.canceled && result.filePath) {
    const filePath = result.filePath;

    try {
      await fs.writeFile(filePath, '');

      updateFiles(filePath);
      console.log('File created successfully');
    } catch (error) {
      console.error('Error creating file:', error);
    }
  }
}

function updateFiles(filePath: string) {
  const files: File[] = configStorage.get('files', []);

  const existingFileIndex = files.findIndex((file) => file.path === filePath);

  if (existingFileIndex !== -1) {
    files[existingFileIndex].active = true;
  } else {
    files.push({
      active: true,
      path: filePath,
      filename: path.basename(filePath),
    });
  }

  files.forEach((file) => {
    if (file.path !== filePath) {
      file.active = false;
    }
  });

  configStorage.set('files', files);
  configStorage.set('activeFile', files.find((file) => file.active === true)?.path);

  // todo: maybe not ideal here
  mainWindow?.webContents.send('updateConfig', configStorage.get());

  createFileWatchers(files);

  processDataRequest(configStorage.get('activeFile'));
}

export const setActiveFile = (event, args) => {
  try {
    const index = args[0];
    const remove = args[1];

    let files = configStorage.get('files') || [];
    let activeFile;
    let newIndex;

    files = files.map((file, i) => {
      const isActive = i === index && !remove;
      return {
        ...file,
        active: isActive,
      };
    });

    if (remove) {
      files.splice(index, 1);
      activeFile = files.length > 0 ? files[0].path : '';

      if (files.length > 0) {
        files[0].active = true;
      }
      newIndex = 0;
    } else {
      activeFile = files[index].path;
      newIndex = index;
    }

    configStorage.set('files', files);
    configStorage.set('activeFile', activeFile);

    event.reply('setFile', newIndex);

    createFileWatchers(files);

    console.log(`Active file is set to ${activeFile}`);
  } catch (error) {
    console.error(error);
    event.reply('displayErrorFromMainProcess', error);
  }
};