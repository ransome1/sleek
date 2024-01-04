import chokidar, { FSWatcher } from 'chokidar';
import { processDataRequest, searchString } from '../ProcessDataRequest/ProcessDataRequest';
import { configStorage } from '../../config';
import { eventListeners } from '../../main';

let watcher: FSWatcher | null = null;

function createFileWatcher(files: FileObject[]): void {
  if(watcher) {
    watcher?.close();
    console.log(`Destroyed old file watcher`);
  }

  watcher = chokidar.watch(files.map((file) => file.todoFilePath), {
    awaitWriteFinish: {
      stabilityThreshold: 50,
      pollInterval: 50,
    },
  });

  watcher
    .on('add', (file) => {
      console.log(`Watching new file: ${file}`);
    })
    .on('change', async (file) => {
      try {
        await processDataRequest(searchString);
        console.log(`${file} has been changed`);
      } catch(error: any) {
        console.error(error.message);
      }
    })
    .on('unlink', (file) => {
      console.log(`Unlinked file: ${file}`);
      const updatedFiles = files.filter((item) => item.todoFilePath !== file);
      configStorage.set('files', updatedFiles);
    });

  eventListeners.watcher = watcher;
}

export { createFileWatcher, watcher };
