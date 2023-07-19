import { app, Menu, dialog, shell } from 'electron';
import path from 'path';
import { setFile } from './modules/File';
import { mainWindow } from './main';
import { openFile, createFile } from './modules/FileDialog';

const appPackage = require('../../release/app/package.json');
const description = appPackage.description;

function buildMenu(files) {
  if (!files) {
    files = [];
  }

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
        ...(files.length > 0
          ? files.map((file, index) => ({
              label: file.filename,
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

  const fileMenu = template.find(item => item.id === 'fileMenu');
  const filesSubMenu = {
    label: 'Files',
    submenu: files.map((file, index) => ({
      label: file.filename,
      accelerator: `CommandOrControl+${index + 1}`,
      click: () => {
        setFile(undefined, index);
      },
    })),
  };
  fileMenu.submenu.push(filesSubMenu);
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

export default buildMenu;
