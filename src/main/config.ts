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
      { id: "1", value: "priority", invert: false },
      { id: "2", value: "projects", invert: false },
      { id: "3", value: "contexts", invert: false },
      { id: "4", value: "due", invert: false },
      { id: "5", value: "t", invert: false },
      { id: "6", value: "completed", invert: false },
      { id: "7", value: "created", invert: false },
    ],
    appendCreationDate: false,
    hideCompleted: true,
    windowMaximized: false,
    completedLast: false,
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

configStorage.onDidChange('hideCompleted', async () => {
  const [sortedTodoObjects, attributes, headers, filters] = await processDataRequest();
  mainWindow.send('requestData', sortedTodoObjects, attributes, headers, filters);
});

configStorage.onDidChange('sorting', async (newValue) => {
  console.log(newValue)
  const [sortedTodoObjects, attributes, headers, filters] = await processDataRequest();
  mainWindow.send('requestData', sortedTodoObjects, attributes, headers, filters);
  mainWindow.send('updateSorting', newValue);
});

export { configStorage, filterStorage };



