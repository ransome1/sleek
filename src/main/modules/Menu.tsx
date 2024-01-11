import { app, Menu, dialog, shell } from 'electron';
import { setFile } from './File/File';
import { mainWindow, handleCreateWindow } from '../main';
import { openFile, createFile } from './File/Dialog';
import { handleRequestArchive } from './File/Archive';
import { configStorage, filterStorage } from '../config';
import appPackage from '../../../release/app/package.json';

const isMac: boolean = process.platform === 'darwin';
const description = appPackage.description;

function createMenu(files: FileObject[]) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'sleek',
      type: 'submenu',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const options = {
              title: 'About sleek',
              message: `sleek v${app.getVersion()}`,
              detail: description,
              buttons: [
                'Close',
                'Reveal configuration folder',
              ],
            };
            const buttonClicked = await dialog.showMessageBox(options);
            if(buttonClicked.response === 1) {
              const pathToReveal = app.getPath('userData');
              shell.showItemInFolder(pathToReveal);
            }
          },
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow!.webContents.send('isSettingsOpen', true);
          },
        },
        ...(isMac
        ? [
            { type: 'separator' },
            {
              accelerator: 'Cmd+H',
              role: 'hide',
            }
          ]
        : []),
        { type: 'separator' },
        {
          role: 'quit',
          accelerator: 'CmdOrCtrl+Q'
        },
      ],
    },
    {
      id: 'fileMenu',
      label: 'File',
      submenu: [
        { type: 'separator' },
        {
          label: 'Open file',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await openFile(false);
          },
        },
        {
          label: 'Create file',
          click: async () => {
            await createFile(false);
          },
        },
        { type: 'separator' },
        ...(files?.length > 0
          ? files.map((file: FileObject, index: number) => ({
              label: file.todoFileName,
              accelerator: `CommandOrControl+${index + 1}`,
              click: () => {
                setFile(index);
              },
            }))
          : [])
      ],
    },
    {
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [
      ...(files?.length > 0
      ? [{
          label: 'Toggle drawer',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            const isDrawerOpen = configStorage.get('isDrawerOpen');
            configStorage.set('isDrawerOpen', !isDrawerOpen);
          },
        },
        {
          label: 'Toggle file tabs',
          click: () => {
            const showFileTabs = configStorage.get('showFileTabs');
            configStorage.set('showFileTabs', !showFileTabs);
          },
        }]
        : []),
        {
          label: 'Toggle navigation',
          accelerator: 'Ctrl+Alt+H',
          click: () => {
            const isNavigationOpen = configStorage.get('isNavigationOpen');
            configStorage.set('isNavigationOpen', !isNavigationOpen);
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
    ...(files?.length > 0
      ? [{
          label: 'Todos',
          submenu: [
            {
              label: 'Add new todo',
              accelerator: 'CmdOrCtrl+N',
              click: () => {
                mainWindow?.webContents.send('isDialogOpen');
              },
            },
            {
              label: 'Find',
              accelerator: 'CmdOrCtrl+F',
              click: () => {
                const isSearchOpen = configStorage.get('isSearchOpen');
                configStorage.set('isSearchOpen', !isSearchOpen);
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
              label: 'Reset filters',
              accelerator: 'CmdOrCtrl+0',
              click: async () => {
                filterStorage.set('filters', {});
              },
            },
            {
              label: 'Archive completed todos',
              accelerator: 'Ctrl+Alt+A',
              click: () => {
                handleRequestArchive();
              },
            },
          ],
        }]
    : []),
    {
      role: 'window',
      submenu: [
        {
          label: 'Close window',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
        {
          label: 'Open window',
          click: () => {
            handleCreateWindow();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'sleek wiki',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/wiki');
          },
        },
        {
          label: 'Report bugs',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/issues');
          },
        },
        {
          label: 'Discuss new or existing features',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/discussions');
          },
        },
        {
          label: 'Contributing',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md');
          },
        },
        {
          label: 'Keyboard shortcuts',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts#v2x');
          },
        },
        {
          label: 'Privacy policy',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/blob/master/PRIVACY.md');
          },
        },
        {
          label: 'Sponsoring',
          click: () => {
            shell?.openExternal('https://github.com/sponsors/ransome1');
          },
        },
        {
          label: 'sleek on GitHub',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/');
          },
        },
        {
          role: 'toggleDevTools',
          label: 'Developer tools'
        },
        {
          role: 'reload',
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

export { createMenu };
