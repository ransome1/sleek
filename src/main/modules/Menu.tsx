import { app, Menu, dialog, shell } from 'electron';
import path from 'path';
import { setFile } from './File/File';
import archiveTodos from './File/Archive';
import { getActiveFile } from './File/File';
import { mainWindow } from '../main';
import { openFile, createFile } from './File/Dialog';
import { configStorage, filterStorage } from '../config';
import { File } from '../util';

const isMac = process.platform === 'darwin';
const appPackage = require('../../../release/app/package.json');
const description = appPackage.description;

function createMenu(files: File[]) {
  try {
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
            label: 'Settings',
            accelerator: 'CmdOrCtrl+.',
            click: () => {
              mainWindow!.webContents.send('setIsSettingsOpen');
            },
          },
          { type: 'separator' },
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
                label: file.todoFileName,
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
        label: 'View',
        submenu: [
          {
            label: 'Toggle drawer',
            accelerator: 'CmdOrCtrl+B',
            click: () => {
              mainWindow!.webContents.send('setIsDrawerOpen');
            },
          },        
          {
            label: 'Toggle navigation',
            accelerator: 'Ctrl+Alt+H',
            click: () => {
              mainWindow!.webContents.send('setIsNavigationOpen');
            },
          },
          {
            label: 'Toggle file tabs',
            click: () => {
              mainWindow!.webContents.send('setShowFileTabs');
            },
          },
          {
            label: 'Toggle theme',
            accelerator: 'Ctrl+Alt+D',
            click: () => {
              const shouldUseDarkColors = configStorage.get('shouldUseDarkColors');
              configStorage.set('colorTheme', (shouldUseDarkColors) ? 'light' : 'dark')
            },
          },        
        ],
      },    
      {
        label: 'Todos',
        submenu: [
          {
            label: 'Find',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              mainWindow!.webContents.send('setIsSearchOpen');
            },
          },
          {
            label: 'Toggle completed',
            accelerator: 'Ctrl+H',
            click: async () => {
              const showCompleted = configStorage.get('showCompleted');
              configStorage.set('showCompleted', !showCompleted);
            },
          },
          {
            label: 'Reset search and filters',
            accelerator: 'Ctrl+0',
            click: async () => {
              filterStorage.set('filters', {});
            },
          },
          {
            label: 'Archive completed todos',
            accelerator: 'Ctrl+Alt+A',
            click: () => {
              mainWindow!.webContents.send('archiveTodos');
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
            label: 'sleek on GitHub',
            click: () => {
              shell.openExternal('https://github.com/ransome1/sleek/');
            },
          },
          {
            role: 'toggleDevTools',
            label: 'Developer tools'
          },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    return Promise.resolve('Menu created');
  } catch(error) {
    return Promise.reject(error);
  }
}

export default createMenu;
