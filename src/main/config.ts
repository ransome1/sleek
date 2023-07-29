import Store from 'electron-store';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { mainWindow } from './main';
import buildMenu from './menu';
import processDataRequest from './modules/processDataRequest';

const userDataDirectory = path.join(app.getPath('userData'), 'userData');
console.log('config.ts: sleek userdata is located at: ' + userDataDirectory)

if (!fs.existsSync(userDataDirectory)) {
  fs.mkdirSync(userDataDirectory);
}

const configPath = path.join(userDataDirectory, 'config.json');
const configStorage = new Store({ cwd: userDataDirectory, name: 'config' });
const filtersPath = path.join(userDataDirectory, 'filters.json');
const filterStorage = new Store({ cwd: userDataDirectory, name: 'filters' });

if (!fs.existsSync(configPath)) {
  const defaultConfigData = {
    sorting: [
      "priority",
      "due",
      "projects",
      "contexts",
      "t",
      "completed",
      "created"
    ],
    appendCreationDate: false,
    hideCompleted: true,
    windowMaximized: false,
  };

  fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2));
}

if (!fs.existsSync(filtersPath)) {
  const defaultFilterData = {};
  fs.writeFileSync(filtersPath, JSON.stringify(defaultFilterData));
}

configStorage.onDidChange('files', (newValue, oldValue) => {
  buildMenu(newValue);
  mainWindow.webContents.send('updateFiles', newValue);
});

configStorage.onDidChange('hideCompleted', async (newValue, oldValue) => {
  const [sortedTodoObjects, attributes, headers, filters] = await processDataRequest();
  mainWindow.send('requestData', sortedTodoObjects, attributes, headers, filters);
});

export { configStorage, filterStorage };



