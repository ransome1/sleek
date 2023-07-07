import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './todoObjects';
import { activeFile } from '../util';
import { mainWindow } from '../main';

let watcher: FSWatcher | null = null;

function createFileWatchers(files: { path: string }[]) {
  if (!files || files.length === 0) {
    throw new Error('Filewatcher: No files available');
  }
  if (watcher) {
    watcher.close();
  }
  watcher = chokidar.watch(files.map((file) => file.path), { persistent: true });

  watcher
    .on('add', (file) => {
      console.log(`New file added: ${file}`);
    })
    .on('change', async (file) => {
      try {
        console.log(`File ${file} has been changed`);
        
        const activeFilePath = activeFile()?.path || '';
        if (file !== activeFilePath) {
          return false;
        }
        await processDataRequest(file);
      } catch (error) {
        console.error(error);
        mainWindow?.webContents.send('displayErrorFromMainProcess', error);
      }
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
