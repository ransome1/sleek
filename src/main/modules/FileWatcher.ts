import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './ProcessDataRequest';
import { mainWindow } from '../main';
import { configStorage } from '../config';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: { path: string }[]) {
  try {  
    
    if (watcher) {
      watcher.close();
    }

    watcher = chokidar.watch(files.map((file) => file.path), { persistent: true });

    watcher
      .on('add', (file) => {
        console.log(`FileWatcher.ts: New file added: ${file}`);
      })
      .on('change', async (file) => {
        console.log(`File ${file} has been changed`);
        processDataRequest().then(([sortedTodoObjects, attributes, headers, filters]) => {
          mainWindow.send('requestData', sortedTodoObjects, attributes, headers, filters);
        }).catch((error) => {
          console.log(error);
        });        
      })
      .on('unlink', (file) => {
        console.log(`FileWatcher.ts: File ${file} has been unlinked`);

        const updatedFiles = files.filter(item => item.path !== file);
        configStorage.set('files', updatedFiles);
        mainWindow.send('updateFiles', updatedFiles);

      })
      .on('ready', () => {
        console.log('FileWatcher.ts: Initial scan complete. Ready for changes');
      });
    
    return Promise.resolve('File watchers created');

  } catch(error) {
    console.error(error)
  }
}

export default createFileWatcher;
