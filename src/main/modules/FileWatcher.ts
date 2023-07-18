import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './TodoObjects';
import { getActiveFile } from './ActiveFile';
import { mainWindow } from '../main';

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
      .on('change', (file) => {
        console.log(`File ${file} has been changed`);
        
        if (file !== getActiveFile().path) {
          return false;
        }
        processDataRequest(getActiveFile()).then(function(response) {
          console.info('FileWatcher.ts: File changed:', response);
        }).catch(function(error) {
          throw error;
        });
      })
      .on('unlink', (file) => {
        console.log(`FileWatcher.ts: File ${file} has been unlinked`);
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
