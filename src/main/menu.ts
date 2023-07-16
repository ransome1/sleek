import { app, Menu, dialog, shell } from 'electron';
import path from 'path';
import { openFile, createFile } from './modules/File';

const appPackage = require('../../release/app/package.json');
const description = appPackage.description;

const template = [
  {
    label: 'sleek',
    submenu: [
      {
        label: 'About',
        click: () => {
          const options = {
            type: 'info',
            title: 'About sleek',
            message: `sleek v${app.getVersion()}`,
            detail: description,
            buttons: ['OK']
          };
          dialog.showMessageBox(options);
        }
      },
      {
        label: 'Hide',
        accelerator: 'CmdOrCtrl+H',
        role: 'hide',
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      },
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open todo.txt file',
        accelerator: 'CmdOrCtrl+O',
        click: openFile,
      },
      {
        label: 'Create todo.txt file',
        click: createFile,
      },
      {
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectall' },
    ],
  },
  {
    label: 'View',
    submenu: [
      // Other submenu items...
      {
        role: 'reload',
        visible: false, // Set the visibility to false to hide the reload menu item
      },
    ],
  },
];

// Set the application menu
const menu = Menu.buildFromTemplate(template);

export default menu;
