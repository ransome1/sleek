import { shell, IpcMainEvent } from 'electron';
import { configStorage } from '../../config';
import createFileWatcher from './Watcher';
import path from 'path';
import { File } from '../../util';

async function addFile(event: Event | null, filePath: string): Promise<void> {
  try {
    const files: File[] = configStorage.get('files') || [];

    files.forEach((file) => (file.active = false));

    const existingFileIndex = files.findIndex((file) => file.todoFilePath === filePath);

    if (existingFileIndex === -1) {
      files.push({
        active: true,
        todoFileName: path.basename(filePath),
        todoFilePath: filePath,
        doneFilePath: path.join(path.dirname(filePath), 'done.txt'),
      });
    } else {
      files[existingFileIndex].active = true;
    }

    configStorage.set('files', files);

    await createFileWatcher(files);

    console.info('File.ts: File added, restarting file watchers');
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
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

    configStorage.set('files', files);

    const response = await createFileWatcher(files);
    console.info('File.ts: File removed, restarting file watchers');

    return;
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
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

    return;
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
  }
}

function revealFile(event: IpcMainEvent, index: number): void {
  try {

    const  files: File[] = configStorage.get('files') as File[];

    const fileToReveal = files[index].todoFilePath;

    if(fileToReveal) {
      shell.showItemInFolder(fileToReveal);
      console.info('File.ts: File revealed in file manager');
    }    
    return;
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
  }
}

export { setFile, removeFile, addFile, revealFile };
