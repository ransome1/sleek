import { app, Menu, dialog } from 'electron';

const appPackage = app.getAppPath('package.json');
const description = appPackage.description;

// Create the application menu
const template: Electron.MenuItemConstructorOptions[] = [
  // Other menu items...
  {
    label: 'sleek',
    submenu: [
      {
        label: 'About',
        click: () => {
          const options: Electron.MessageBoxOptions = {
            type: 'info',
            title: 'About sleek',
            message: `sleek v${app.getVersion()}`, // Retrieve the version number dynamically
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
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
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
