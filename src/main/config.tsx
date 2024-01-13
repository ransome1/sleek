import Store from 'electron-store';
import path from 'path';
import { app, nativeTheme } from 'electron';
import fs from 'fs';
import { mainWindow } from './main';
import { createFileWatcher } from './modules/File/Watcher';
import { createTray } from './modules/Tray';
import { processDataRequest, searchString } from './modules/ProcessDataRequest/ProcessDataRequest';
import handleTheme from './modules/Theme';
import crypto from 'crypto';

Store.initRenderer();

const environment: string | undefined = process.env.NODE_ENV;

const anonymousUserId: string = crypto.randomUUID() || null;

const userDataDirectory: string = (environment === 'development') ? path.join(app.getPath('userData'), 'userData-Development') : path.join(app.getPath('userData'), 'userData');

if(!fs.existsSync(userDataDirectory)) fs.mkdirSync(userDataDirectory)

console.log('config.ts: sleek userdata is located at: ' + userDataDirectory);

const customStylesPath: string = path.join(userDataDirectory, 'customStyles.css');

const configStorage: Store<Settings> = new Store<Settings>({
  cwd: userDataDirectory,
  name: 'config',
  beforeEachMigration: context => {
    console.log(`[config.json] migrating from ${context.fromVersion} → ${context.toVersion}`);
  },
  migrations: {
    '2.0.0': store => {
      store.setConfig('sorting', [
        { id: '1', value: 'priority', invert: false },
        { id: '2', value: 'projects', invert: false },
        { id: '3', value: 'contexts', invert: false },
        { id: '4', value: 'due', invert: false },
        { id: '5', value: 't', invert: false },
        { id: '6', value: 'completed', invert: false },
        { id: '7', value: 'created', invert: false },
        { id: '8', value: 'rec', invert: false },
        { id: '9', value: 'pm', invert: false },
      ]);
      store.setConfig('accordionOpenState', [
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false
      ]);
      store.setConfig('files', []);
      store.setConfig('appendCreationDate', false);
      store.setConfig('showCompleted', true);
      store.setConfig('showHidden', false);
      store.setConfig('windowMaximized', false);
      store.setConfig('fileSorting', false);
      store.setConfig('convertRelativeToAbsoluteDates', true);
      store.setConfig('thresholdDateInTheFuture', true);
      store.setConfig('colorTheme', 'system');
      store.setConfig('shouldUseDarkColors', false);
      store.setConfig('notificationsAllowed', true);
      store.setConfig('notificationThreshold', 2);
      store.setConfig('showFileTabs', true);
      store.setConfig('isNavigationOpen', true);
      store.setConfig('customStylesPath', customStylesPath);
      store.setConfig('tray', false);
      store.setConfig('zoom', 100);
      store.setConfig('multilineTextField', false);
      store.setConfig('useMultilineForBulkTodoCreation', false);
      store.setConfig('matomo', true);
    },
    '2.0.1': store => {
      store.setConfig('anonymousUserId', anonymousUserId);
    },
    '2.0.2': store => {
      store.setConfig('dueDateInTheFuture', true);
    },
    '2.0.4': store => {
      store.delete('multilineTextField');
      store.delete('isDrawerOpen');
      store.delete('useMultilineForBulkTodoCreation');
      store.setConfig('bulkTodoCreation', false);
      store.setConfig('disableAnimations', false);
    },
  }
});

const filterStorage = new Store<Filters>({ cwd: userDataDirectory, name: 'filters' });

if(!filterStorage.has('search')) {
  filterStorage.set('search', []);
} else if(!filterStorage.has('attributes')) {
  filterStorage.set('attributes', {});
}

const notifiedTodoObjectsPath = path.join(userDataDirectory, 'notifiedTodoObjects.json');
const notifiedTodoObjectsStorage = new Store<{}>({ cwd: userDataDirectory, name: 'notifiedTodoObjects' });

if(!fs.existsSync(notifiedTodoObjectsPath)) {
  const defaultNotifiedTodoObjectsData = {};
  fs.writeFileSync(notifiedTodoObjectsPath, JSON.stringify(defaultNotifiedTodoObjectsData));
}

if(!fs.existsSync(customStylesPath)) {
  fs.writeFileSync(customStylesPath, '');
}

filterStorage.onDidAnyChange(async () => {
  try {
    await processDataRequest(searchString);
  } catch(error: any) {
    console.error(error);
  }
});

configStorage.onDidAnyChange(async(settings) => {
  try {
    await processDataRequest(searchString);
    mainWindow!.webContents.send('settingsChanged', settings);
  } catch(error: any) {
    console.error(error);
  }
});

configStorage.onDidChange('files', (files: FileObject[] | null) => {
  try {
    if(files) {
      createFileWatcher(files);
    }
  } catch(error: any) {
    console.error(error);
  }
});

configStorage.onDidChange('colorTheme', (colorTheme) => {
  if(colorTheme === 'system' || colorTheme === 'light' || colorTheme === 'dark') {
    nativeTheme.themeSource = colorTheme;
  }
});

configStorage.onDidChange('tray', () => {
  try {
    createTray();
  } catch(error: any) {
    console.error(error);
  }
});

nativeTheme.on('updated', handleTheme);

export { configStorage, filterStorage, notifiedTodoObjectsStorage };
