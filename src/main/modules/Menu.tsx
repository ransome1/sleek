import { app, Menu, dialog, shell } from 'electron';
import { setFile } from './File/File';
import { mainWindow } from '../main';
import { openFile, createFile } from './File/Dialog';
import { configStorage, filterStorage } from '../config';
import appPackage from '../../../release/app/package.json';

const isMac: boolean = process.platform === 'darwin';
const description = appPackage.description;

function createMenu(files: FileObject[]) {
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'sleek',
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
            mainWindow!.webContents.send('setIsSettingsOpen');
          },
        },
        ...(isMac
        ? [
            { type: 'separator' },
            {
              label: 'Hide',
              accelerator: 'Cmd+H',
              role: 'hide',
            },
          ]
        : []),
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
          : []),
        { type: 'separator' },
        {
          label: 'Close window',
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
            mainWindow!.webContents.send('triggerArchiving');
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
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

export { createMenu };
