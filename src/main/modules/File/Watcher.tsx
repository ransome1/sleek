import chokidar, { FSWatcher } from 'chokidar';
import { processDataRequest, searchString } from '../ProcessDataRequest/ProcessDataRequest';
import { config } from '../../config';
import { eventListeners } from '../../main';

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

  const fileWatcherAtomic = config.get('fileWatcherAtomic') || 1000;
  const fileWatcherPolling = config.get('fileWatcherPolling') || false;
  const fileWatcherPollingInterval = config.get('fileWatcherPollingInterval') || 100;

  watcher = chokidar.watch(files.map((file) => file.todoFilePath), {
    atomic: fileWatcherAtomic,
    usePolling: fileWatcherPolling,
    interval: fileWatcherPollingInterval
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
      config.set('files', updatedFiles);
    });

  eventListeners.watcher = watcher;
}

export { createFileWatcher, watcher };
