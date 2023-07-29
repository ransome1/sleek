import { app, Menu, dialog, shell } from 'electron';
import path from 'path';
import { setFile } from './modules/File';
import { mainWindow } from './main';
import { openFile, createFile } from './modules/FileDialog';
import { configStorage } from './config';

const isMac = process.platform === 'darwin';
const appPackage = require('../../release/app/package.json');
const description = appPackage.description;

interface File {
  active: boolean;
  path: string;
  filename: string;
}

function buildMenu(files: File[] = []) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'sleek',
      submenu: [
        {
          label: 'About',
          click: () => {
            const options: Electron.MessageBoxOptions = {
              type: 'info',
              title: 'About sleek',
              message: `sleek v${app.getVersion()}`,
              detail: description,
              buttons: ['OK'],
            };
            dialog.showMessageBox(options);
          },
        },
        {
          label: 'Hide',
          accelerator: isMac ? 'Cmd+H' : 'Win+D',
          role: 'hide',
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      id: 'fileMenu',
      label: 'File',
      submenu: [
        { type: 'separator' },
        {
          label: 'Open todo.txt file',
          accelerator: 'CmdOrCtrl+O',
          click: openFile,
        },
        {
          label: 'Create todo.txt file',
          click: createFile,
        },
        { type: 'separator' },
        ...(files?.length > 0
          ? files.map((file, index) => ({
              label: file.filename,
              accelerator: `CommandOrControl+${index + 1}`,
              click: () => {
                setFile(index);
              },
            }))
          : []),
        { type: 'separator' },
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
      label: 'Todos',
      submenu: [
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            // Handle Find functionality
          },
        },
        {
          label: 'Hide completed',
          accelerator: 'Ctrl+H',
          click: async () => {
            const hideCompleted = configStorage.get('hideCompleted');
            configStorage.set('hideCompleted', !hideCompleted);
          },
        },        
        {
          role: 'reload',
          visible: false,
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'sleek wiki',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/wiki');
          },
        },
        {
          label: 'Report bugs',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/issues');
          },
        },
        {
          label: 'Discuss new or existing features',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/discussions');
          },
        },
        {
          label: 'Contributing',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md');
          },
        },
        {
          label: 'Keyboard shortcuts',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts#v2x');
          },
        },
        {
          label: 'Privacy policy',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/blob/master/PRIVACY.md');
          },
        },
        {
          label: 'Sponsoring',
          click: () => {
            shell.openExternal('https://github.com/sponsors/ransome1');
          },
        },
        {
          label: 'Changelog',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/blob/master/CHANGELOG.md');
          },
        },
        {
          label: 'sleek on GitHub',
          click: () => {
            shell.openExternal('https://github.com/ransome1/sleek/');
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

export default buildMenu;
