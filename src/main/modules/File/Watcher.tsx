import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from '../ProcessDataRequest';
import { mainWindow, eventListeners } from '../../main';
import { configStorage } from '../../config';
import { File } from '../../util';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: File[]): string {
  try {
    if (watcher) {
      watcher?.close();
    }

    watcher = chokidar.watch(files.map((file) => file.todoFilePath), {
      awaitWriteFinish: {
        stabilityThreshold: 50,
        pollInterval: 50,
      },
    });

    watcher
      .on('add', (file) => {
        console.log(`FileWatcher.ts: New file added: ${file}`);
      })
      .on('change', async (file) => {
        console.log(`File ${file} has been changed`);
        try {
          const [todoObjects, attributes, headers, filters] = await processDataRequest('');
          mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
        } catch (error: any) {
          console.error(error);
        }
      })
      .on('unlink', (file) => {
        console.log(`FileWatcher.ts: File ${file} has been unlinked`);

        const updatedFiles = files.filter((item) => item.todoFilePath !== file);
        configStorage.set('files', updatedFiles);
      })
      .on('ready', () => {
        console.log('FileWatcher.ts: Initial scan complete. Ready for changes');
      });

    eventListeners.watcher = watcher;

    return 'File watchers created';
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

export { createFileWatcher, watcher };