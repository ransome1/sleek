import chokidar, { FSWatcher } from 'chokidar';
import processDataRequest from './TodoObjects';
import { getActiveFile } from './File';
import { mainWindow } from '../main';
import { configStorage } from '../config';

let watcher: FSWatcher | null = null;

function createFileWatchers(files: { path: string }[]) {

  if(!files || Object.keys(files).length === 0) {
    mainWindow?.webContents.send('setFile', files);
    mainWindow?.webContents.send('showSplashScreen', 'noFiles');
    return 'Filewatcher: No files available';
  }
  if (watcher) {
    watcher.close();
  }
  watcher = chokidar.watch(files.map((file) => file.path), { persistent: true });

  watcher
    .on('add', (file) => {
      console.log(`New file added: ${file}`);
    })
    .on('change', (file) => {
      try {
        console.log(`File ${file} has been changed`);
        
        if (file !== getActiveFile().path) {
          return false;
        }
        processDataRequest(file).then(function(response) {
          console.info(response);
        }).catch(function(error) {
          throw "error";
        });
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
      mainWindow?.webContents.send('setFile', files);
    });
  return 'Filewatcher: File watchers created';
}

export default createFileWatchers;
