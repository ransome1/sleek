import Store from 'electron-store';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { mainWindow } from './main';
import buildMenu from './menu';
import { Sorting, File } from './util';
import processDataRequest from './modules/ProcessDataRequest';

const userDataDirectory = path.join(app.getPath('userData'), 'userData' + app.getVersion());
console.log('config.ts: sleek userdata is located at: ' + userDataDirectory);

if (!fs.existsSync(userDataDirectory)) {
  fs.mkdirSync(userDataDirectory);
}

const configPath = path.join(userDataDirectory, 'config.json');
const configStorage = new Store<{ files: File[], sorting: Sorting[]; appendCreationDate: boolean; showCompleted: boolean; showHidden: boolean; windowMaximized: boolean; fileSorting: boolean }>({ cwd: userDataDirectory, name: 'config' });
const filtersPath = path.join(userDataDirectory, 'filters.json');
const filterStorage = new Store<{}>({ cwd: userDataDirectory, name: 'filters' });

if (!fs.existsSync(configPath)) {
  const defaultConfigData = {
    files: [],
    sorting: [
      { id: '1', value: 'priority', invert: false },
      { id: '2', value: 'projects', invert: false },
      { id: '3', value: 'contexts', invert: false },
      { id: '4', value: 'due', invert: false },
      { id: '5', value: 't', invert: false },
      { id: '6', value: 'completed', invert: false },
      { id: '7', value: 'created', invert: false },
    ],
    appendCreationDate: false,
    showCompleted: true,
    showHidden: true,
    windowMaximized: false,
    fileSorting: false,
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2));
}

if (!fs.existsSync(filtersPath)) {
  const defaultFilterData = {};
  fs.writeFileSync(filtersPath, JSON.stringify(defaultFilterData));
}

const handleConfigChange = async (key: string, newValue: any) => {
  // todo: what if search string was set previously? This would remove it
  const result = await processDataRequest('');
  
  if (result !== null) {
    const [ flattenedTodoObjects, attributes, headers, filters ] = result;
  
    mainWindow!.webContents.send('requestData', flattenedTodoObjects, attributes, headers, filters);
  
    if (key === 'sorting') {
      mainWindow!.webContents.send('updateSorting', newValue);
    }
  }
};

configStorage.onDidChange('files', (files) => {
  buildMenu(files);
  mainWindow!.webContents.send('updateFiles', files);
});

configStorage.onDidChange('showCompleted', () => {
  handleConfigChange('showCompleted', configStorage.get('showCompleted'));
});

configStorage.onDidChange('showHidden', () => {
  handleConfigChange('showHidden', configStorage.get('showHidden'));
});

configStorage.onDidChange('sorting', (sorting) => {
  handleConfigChange('sorting', sorting);
});

configStorage.onDidChange('fileSorting', (fileSorting) => {
  handleConfigChange('fileSorting', fileSorting);
});

export { configStorage, filterStorage };
