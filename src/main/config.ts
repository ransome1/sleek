import Store from 'electron-store';
import path from 'path';
import { app, dialog } from 'electron';

const configPath = path.join(__dirname, '../testData/');
const configStorage = new Store({ cwd: configPath });

if (!configStorage.path || configStorage.size === 0) {
  dialog.showErrorBox(
    'Error',
    `The configuration file at ${configPath} could not be found or is empty. Please make sure the config file exists.`
  );
  app.quit();
  process.exit(1);
}

const filterStoragePath = path.join(__dirname, '../testData/');
const filterStorage = new Store({ cwd: filterStoragePath });

if (!filterStorage.path || filterStorage.size === 0) {
  dialog.showErrorBox(
    'Error',
    `The filter file at ${filterStoragePath} could not be found or is empty. Please make sure the config file exists.`
  );
  app.quit();
  process.exit(1);
}

export { configStorage, filterStorage };
