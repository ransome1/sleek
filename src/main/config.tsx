import Store from 'electron-store';
import path from 'path';
import { app, nativeTheme } from 'electron';
import fs from 'fs';
import { mainWindow } from './main';
import createMenu from './modules/Menu';
import createTray from './modules/Tray';
import { File, ConfigData } from './util';
import processDataRequest from './modules/ProcessDataRequest';
import handleTheme from './modules/Theme';
import crypto from 'crypto';

const anonymousUserId = crypto.randomUUID() || null;

const userDataDirectory = path.join(app.getPath('userData'), 'userData');
if (!fs.existsSync(userDataDirectory)) fs.mkdirSync(userDataDirectory)
console.log('config.ts: sleek userdata is located at: ' + userDataDirectory);

const customStylesPath = path.join(userDataDirectory, 'customStyles.css');
const configPath = path.join(userDataDirectory, 'config.json');
const configStorage = new Store<ConfigData>({
  cwd: userDataDirectory,
  name: 'config',
  beforeEachMigration: (store, context) => {
    console.log(`[config.json] migrating from ${context.fromVersion} → ${context.toVersion}`);
  },  
  migrations: {
    '2.0.0': store => {
      store.set('sorting', [
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
      store.set('accordionOpenState', [
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
      store.set('files', []);
      store.set('appendCreationDate', false);
      store.set('showCompleted', true);
      store.set('showHidden', false);
      store.set('windowMaximized', false);
      store.set('fileSorting', false);
      store.set('convertRelativeToAbsoluteDates', true);
      store.set('thresholdDateInTheFuture', true);
      store.set('colorTheme', 'system');
      store.set('shouldUseDarkColors', false);
      store.set('notificationsAllowed', true);
      store.set('notificationThreshold', 2);
      store.set('showFileTabs', true);
      store.set('isNavigationOpen', true);
      store.set('customStylesPath', customStylesPath);
      store.set('tray', false);
      store.set('zoom', 100);
      store.set('multilineTextField', false);
      store.set('useMultilineForBulkTodoCreation', false);
      store.set('matomo', true);
    },
    '2.0.1': store => {
      store.set('anonymousUserId', anonymousUserId);
    },
    '2.0.2': store => {
      store.set('dueDateInTheFuture', true);
    },
  }  
});
const filtersPath = path.join(userDataDirectory, 'filters.json');
const filterStorage = new Store<{}>({ cwd: userDataDirectory, name: 'filters' });

if (!fs.existsSync(filtersPath)) {
  const defaultFilterData = {};
  fs.writeFileSync(filtersPath, JSON.stringify(defaultFilterData));
}

if (!fs.existsSync(customStylesPath)) {
  fs.writeFileSync(customStylesPath, '');
}

const handleConfigChange = async (key: string, newValue: any) => {
  // todo: what if search string was set previously? This would remove it
  const [todoObjects, attributes, headers, filters] = await processDataRequest('');
  mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
  if (key === 'sorting') {
    mainWindow!.webContents.send('updateSorting', newValue);
  }
};

filterStorage.onDidChange('filters' as never, async () => {
  const [todoObjects, attributes, headers, filters] = await processDataRequest('');
  mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
});

configStorage.onDidChange('files', async (files: File[] | undefined) => {
  if (files) {

    const tray = configStorage.get('tray');

    createMenu(files).then(result => {
      console.log('config.ts:', result);
    }).catch(error => {
      console.error('config.ts:', error);
    });

    if(tray) {
      createTray().then(result => {
        console.log('config.ts:', result);
      }).catch(error => {
        console.error('config.ts:', error);
      });
    }

    mainWindow!.webContents.send('updateFiles', files);
  }
});

configStorage.onDidChange('showCompleted', () => {
  handleConfigChange('showCompleted', configStorage.get('showCompleted'));
});

configStorage.onDidChange('showHidden', () => {
  handleConfigChange('showHidden', configStorage.get('showHidden'));
});

configStorage.onDidChange('thresholdDateInTheFuture', () => {
  handleConfigChange('thresholdDateInTheFuture', configStorage.get('thresholdDateInTheFuture'));
});

configStorage.onDidChange('dueDateInTheFuture', () => {
  handleConfigChange('dueDateInTheFuture', configStorage.get('dueDateInTheFuture'));
});

configStorage.onDidChange('showFileTabs', () => {
  mainWindow!.webContents.send('setShowFileTabs');
});

configStorage.onDidChange('sorting', (sorting) => {
  handleConfigChange('sorting', sorting);
});

configStorage.onDidChange('notificationThreshold', async () => {
  const [todoObjects, attributes, headers, filters] = await processDataRequest('');
  mainWindow!.webContents.send('requestData', todoObjects, attributes, headers, filters);
});

configStorage.onDidChange('fileSorting', (fileSorting) => {
  handleConfigChange('fileSorting', fileSorting);
});

configStorage.onDidChange('colorTheme', (colorTheme) => {
  if (colorTheme === 'system' || colorTheme === 'light' || colorTheme === 'dark') {
    nativeTheme.themeSource = colorTheme;
  }
});

configStorage.onDidChange('tray', () => {
  createTray().then(result => {
    console.log('config.ts:', result);
  }).catch(error => {
    console.error('config.ts:', error);
  });
});

nativeTheme.on('updated', handleTheme);

export { configStorage, filterStorage };
