import Store from 'electron-store';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { setFilesShortcuts } from './modules/File';

const userDataDirectory = path.join(app.getPath('userData'), 'userData');

if (!fs.existsSync(userDataDirectory)) {
  fs.mkdirSync(userDataDirectory);
}

const configPath = path.join(userDataDirectory, 'config.json');
const configStorage = new Store({ cwd: userDataDirectory, name: 'config' });
const filtersPath = path.join(userDataDirectory, 'filters.json');
const filterStorage = new Store({ cwd: userDataDirectory, name: 'filters' });

if (!fs.existsSync(configPath)) {
  const defaultConfigData = {};
  fs.writeFileSync(configPath, JSON.stringify(defaultConfigData));
}

if (!fs.existsSync(filtersPath)) {
  const defaultFilterData = {};
  fs.writeFileSync(filtersPath, JSON.stringify(defaultFilterData));
}

export { configStorage, filterStorage };
