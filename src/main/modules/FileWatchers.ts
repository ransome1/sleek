import chokidar from 'chokidar';
import processTodoTxtObjects from './TodoTxtObjects.ts';
import { mainWindow } from '../main';
import { activeFile } from '../util';

function createFileWatchers(files) {
  if (!files || files.length === 0) {
    throw new Error('Filewatcher: No files available');
  }

  const watcher = chokidar.watch(files.map(file => file.path), { persistent: true });

  watcher
    .on('add', (file) => console.log(`File ${file} has been added`))
    .on('change', async (file) => {
      
      console.log(`File ${file} has been changed`);

      if(file !== activeFile.path) return false

      processTodoTxtObjects(file);
      
    })
    .on('unlink', (file) => console.log(`File ${file} has been unlinked`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'));

  return 'Filewatcher: File watchers created';
}

export default createFileWatchers;
