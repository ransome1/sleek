import chokidar from 'chokidar';
import processTodoTxtObjects from './TodoTxtObjects.ts';
import { activeFile } from '../util';

let watcher = null;

function createFileWatchers(files) {
  if (!files || files.length === 0) {
    throw new Error('Filewatcher: No files available');
  }

  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(files.map(file => file.path), { persistent: true });

  watcher
    .on('add', (file) => {
      console.log(`New file added: ${file}`);
    })
    .on('change', async (file) => {
      console.log(`File ${file} has been changed`);
      if (file !== activeFile().path) {
        return false;
      }
      processTodoTxtObjects(file);
    })
    .on('unlink', (file) => {
      console.log(`File ${file} has been unlinked`);
    })
    .on('ready', () => {
      console.log('Initial scan complete. Ready for changes');
    });

  return 'Filewatcher: File watchers created';
}

export default createFileWatchers;
