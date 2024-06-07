import chokidar, { FSWatcher } from 'chokidar';
import { dataRequest, searchString } from '../DataRequest/DataRequest';
import { config } from '../../config';
import { handleError } from '../../util';
import { mainWindow, eventListeners } from '../../main';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: FileObject[]): void {
  if(watcher) {
    watcher?.close();
    console.log(`Destroyed old file watcher`);
  }

  const hasActiveEntry = files.some(file => file.active);
  if (!hasActiveEntry && files.length > 0) {
    files[0].active = true;
    config.set('files', files)
  }

  watcher = chokidar.watch(files.map((file) => file.todoFilePath), config.get('chokidarOptions'));

  watcher
    .on('add', (file) => {
      console.log(`Watching new file: ${file}`);
    })
    .on('change', (file) => {
      try {
        const requestedData = dataRequest(searchString);
        mainWindow!.webContents.send('requestData', requestedData);
        console.log(`${file} has been changed`);
      } catch(error: any) {
        handleError(error);
      }
    })
    .on('unlink', (file) => {
      console.log(`Unlinked file: ${file}`);
    });

  eventListeners.watcher = watcher;
}

export { createFileWatcher, watcher };
