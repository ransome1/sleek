import Store from 'electron-store';
import path from 'path';
import { app, dialog } from 'electron';

const configFilePath = path.join(__dirname, '../testData/');
const store = new Store({ cwd: configFilePath });
const configExists = store.path && store.size !== 0;

if (!configExists) {
  dialog.showErrorBox(
    'Error',
    `The configuration file at ${configFilePath} could not be found or is empty. Please make sure the config file exists.`
  );
  app.quit();
  process.exit(1);
}

export default store;
