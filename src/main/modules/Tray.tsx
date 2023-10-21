import { app, Tray, Menu } from 'electron';
import { mainWindow, createWindow } from '../main';
import { configStorage } from '../config';
import { getAssetPath } from '../util';
import { setFile } from './File/File';

let tray;

function createMenuTemplate(files) {
  const menuTemplate = [
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
      ? files.map((file, index) => ({
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
            setFile(undefined, index);
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

  return menuTemplate;
}

function createTray() {
  try {
    const isTray = configStorage.get('tray');

    tray?.destroy();

    if (!isTray) {
      if (app.dock) {
        app.dock.show();
      }
      return Promise.resolve('Tray not shown');
    }

    const files = configStorage.get('files') as File[] || [];
    const menu = Menu.buildFromTemplate(createMenuTemplate(files));

    tray = new Tray(getAssetPath('icons/tray/tray.png'));
    tray.setContextMenu(menu);

    return Promise.resolve('Tray created');
  } catch (error) {
    console.error('Error creating tray:', error);
    return Promise.reject(error);
  }
}

export default createTray;
