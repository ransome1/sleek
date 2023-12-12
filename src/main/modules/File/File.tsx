import fs from 'fs';
import { app } from 'electron';
import { configStorage } from '../../config';
import { createFileWatcher } from './Watcher';
import { createTray } from '../Tray';
import { createMenu } from '../Menu';
import path from 'path';
import { File } from '../../util';
import { mainWindow } from '../../main';

let stopAccessingSecurityScopedResource: any;

async function readFileContent(filePath: string, bookmark: string | null) {
  
  if (filePath === null) {
    throw new Error('No path has been passed');
  }

  if(bookmark) app.startAccessingSecurityScopedResource(bookmark)

  const fileContent = await fs.promises.readFile(filePath, 'utf8');
  
  if(bookmark) stopAccessingSecurityScopedResource()

  return fileContent;
}

function addFile(filePath: string, bookmark: string | null) {
  const files: File[] = configStorage.get('files');
  const existingFileIndex = files.findIndex((file) => file.todoFilePath === filePath);

  files.forEach((file) => (file.active = false));

  if (existingFileIndex === -1) {
    files.push({
      active: true,
      todoFileName: path.basename(filePath),
      todoFilePath: filePath,
      todoFileBookmark: bookmark,
      doneFilePath: null,
      doneFileBookmark: null
    });
  } else {
    files[existingFileIndex].active = true;
  }

  configStorage.set('files', files);

  createFileWatcher(files);

  createMenu(files);

  const tray = configStorage.get('tray');
  if(tray) {
    createTray();
  }

  return 'File added';
}

function addDoneFile(filePath: string, bookmark: string | null) {
  const files: File[] = configStorage.get('files');
  const activeIndex: number = files.findIndex((file) => file.active);

  if(activeIndex === -1) return false;

  files[activeIndex].doneFilePath = filePath;
  files[activeIndex].doneFileBookmark = bookmark;

  configStorage.set('files', files);

  mainWindow!.webContents.send('triggerArchiving');

  console.info(`File.ts: Done file added for ${files[activeIndex].todoFileName}`);
}

async function removeFile(index: number) {
  let files: File[] = configStorage.get('files');

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

  createMenu(files);

  const tray = configStorage.get('tray');

  if(tray) {
    createTray();
  }    

  console.info('File.ts: File removed, restarting file watchers');
}

function setFile(index: number) {
  const files: File[] = configStorage.get('files');

  if (files.length > 0) {
    files.forEach((file) => {
      file.active = false;
    });
  }

  files[index].active = true;

  configStorage.set('files', files); 
}

export { setFile, removeFile, addFile, addDoneFile, readFileContent };
