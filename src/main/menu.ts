import { app, Menu, dialog, shell } from 'electron';
import path from 'path';
import { setFile } from './modules/File';
import archiveTodos from './modules/ArchiveTodos';
import { getActiveFile } from './modules/ActiveFile';
import { mainWindow } from './main';
import { openFile, createFile } from './modules/FileDialog';
import { configStorage, filterStorage } from './config';
import { File } from './util';

const isMac = process.platform === 'darwin';
const appPackage = require('../../release/app/package.json');
const description = appPackage.description;

function buildMenu(files: File[]) {
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
          ? files.map((file: File, index: number) => ({
              label: file.todoFile,
              accelerator: `CommandOrControl+${index + 1}`,
              click: () => {
                setFile(undefined, index);
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
        { role: 'selectAll' },
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
            const showCompleted = configStorage.get('showCompleted');
            configStorage.set('showCompleted', !showCompleted);
          },
        },
        {
          label: 'Reset filters',
          accelerator: 'Ctrl+0',
          click: async () => {
            filterStorage.set('filters', {});
          },
        },
        {
          label: 'Archive completed todos',
          accelerator: 'Ctrl+Alt+A',
          click: () => {
            const activeFile = getActiveFile(files);
            mainWindow.send('archiveTodos', activeFile.doneFile);
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
