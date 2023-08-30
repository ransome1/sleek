import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './ProcessDataRequest';
import { mainWindow } from '../main';
import { configStorage } from '../config';
import { File } from '../util';
import path from 'path';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: File[]): Promise<string> {
  try {
    if (watcher) {
      watcher.close();
    }
    watcher = chokidar.watch(files.map((file) => path.join(file.path, file.todoFile)), { 
      useFsEvents: false,
      usePolling: false,
      atomic: true 
    });
    watcher
      .on('add', (file) => {
        console.log(`FileWatcher.ts: New file added: ${file}`);
      })
      .on('change', async (file) => {
        console.log(`File ${file} has been changed`);
        try {
          const [sortedTodoObjects, attributes, headers, filters] = await processDataRequest();
          mainWindow.send('requestData', sortedTodoObjects, attributes, headers, filters);
        } catch (error) {
          console.log(error);
        }
      })
      .on('unlink', (file) => {
        console.log(`FileWatcher.ts: File ${file} has been unlinked`);

        const updatedFiles = files.filter((item) => item.path !== file);
        configStorage.set('files', updatedFiles);
        
      })
      .on('ready', () => {
        console.log('FileWatcher.ts: Initial scan complete. Ready for changes');
      });

    return Promise.resolve('File watchers created');
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export default createFileWatcher;
