import { configStorage } from '../../config';
import { createFileWatcher } from './Watcher';
import createTray from '../Tray';
import createMenu from '../Menu';
import path from 'path';
import { File } from '../../util';
import { mainWindow } from '../../main';

function addFile(filePath: string, bookmark: string | null) {
  try {
    const files: File[] = configStorage.get('files') || [];
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

    createMenu(files).then(result => {
      console.log('config.ts:', result);
    }).catch(error => {
      console.error('config.ts:', error);
    });

    const tray = configStorage.get('tray');
    if(tray) {
      createTray().then(result => {
        console.log('config.ts:', result);
      }).catch(error => {
        console.error('config.ts:', error);
      });
    }    

    console.info('File.ts: File added, restarting file watchers');
  } catch (error: any) {
    console.error('File.ts:', error);
    throw error;
  }
}

function addDoneFile(filePath: string, bookmark: string | null) {
  try {
    const files: File[] = configStorage.get('files') || [];
    const activeIndex: number = files.findIndex((file) => file.active);

    if(activeIndex === -1) return false;

    files[activeIndex].doneFilePath = filePath;
    files[activeIndex].doneFileBookmark = bookmark;

    configStorage.set('files', files);

    mainWindow!.webContents.send('triggerArchiving');

    console.info(`File.ts: Done file added for ${files[activeIndex].todoFileName}`);

  } catch (error: any) {
    console.error('File.ts:', error);
    throw error;
  }
}

async function removeFile(index: number): Promise<void> {
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

    configStorage.set('files', files);

    createMenu(files).then(result => {
      console.log('config.ts:', result);
    }).catch(error => {
      console.error('config.ts:', error);
    });    

    const tray = configStorage.get('tray');
    if(tray) {
      createTray().then(result => {
        console.log('config.ts:', result);
      }).catch(error => {
        console.error('config.ts:', error);
      });
    }    

    console.info('File.ts: File removed, restarting file watchers');

    return;
  } catch (error: any) {
    console.error('File.ts:', error);
    throw error;
  }
}

function setFile(index: number): void {
  try {
    const files: File[] = configStorage.get('files') as File[];

    if (files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
    }

    files[index].active = true;

    configStorage.set('files', files); 
    
  } catch (error: any) {
    console.error('File.ts:', error);
    throw error;
  }
}

export { setFile, removeFile, addFile, addDoneFile };
