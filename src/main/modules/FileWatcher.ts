import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './TodoObjects';
import { getActiveFile } from './ActiveFile';
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

        await processDataRequest(getActiveFile()).then(function(response) {
          console.info('FileWatcher.ts: File changed:', response);
        }).catch(function(error) {
          console.error(error);
        });
      })
      .on('unlink', (file) => {
        console.log(`FileWatcher.ts: File ${file} has been unlinked`);

        const updatedFiles = files.filter(item => item.path !== file);
        configStorage.set('files', updatedFiles);

        processDataRequest(getActiveFile()).then(function(response) {
          console.info('FileWatcher.ts: File unlinked:', response);
        }).catch(function(error) {
          console.error(error);
        });

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
