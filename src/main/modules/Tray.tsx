import { app, Menu, Tray } from 'electron';
import { createWindow, mainWindow } from '../main';
import { configStorage } from '../config';
import { getAssetPath, File } from '../util';
import { setFile } from './File/File';

let tray: Tray;

function createMenuTemplate(files: File[]): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Show sleek',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow()
            .then((result) => {
              console.log('main.ts:', result);
            })
            .catch((error) => {
              console.error('main.ts:', error);
            });
        }
      },
    },
    { type: 'separator' },
    ...(files?.length > 0
      ? files.map((file: File, index: number) => ({
        label: file.todoFileName,
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          if (mainWindow) {
            mainWindow.show();
          } else {
            createWindow()
              .then((result) => {
                console.log('main.ts:', result);
              })
              .catch((error) => {
                console.error('main.ts:', error);
              });
          }
          setFile(index);
        },
      }))
      : []),
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ];
}

function createTray() {
  try {
    const isTray = configStorage.get('tray');

    tray?.destroy();

    if (!isTray) {
      app.dock?.show();
      return Promise.resolve('Tray not shown');
    }

    const files = configStorage.get('files') as File[] || [];
    const menu = Menu.buildFromTemplate(createMenuTemplate(files));

    tray = new Tray(getAssetPath('icons/tray/tray.png'));
    tray.setContextMenu(menu);

    return Promise.resolve('Tray created');
  } catch (error: any) {
    console.error('Error creating tray:', error);
    return Promise.reject(error);
  }
}

export default createTray;
