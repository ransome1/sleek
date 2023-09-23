import { app, Tray, Menu } from 'electron';
import { mainWindow, createWindow } from './main';
import { configStorage } from './config';
import { getAssetPath } from './util';
import { setFile } from './modules/File';

let tray;

function getMenuTemplate(files) {
  const menuTemplate = [
    {
      label: 'Show Window',
      click: () => {
        if (mainWindow) {
          mainWindow?.show();
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
    {
      label: 'Hide Window',
      click: () => {
      	if (app.dock) {
        	app.dock.hide();
      	}
        mainWindow?.hide();
      },
    },
    { type: 'separator' },
    ...(files?.length > 0
      ? files.map((file, index) => ({
          label: file.todoFile,
          accelerator: `CommandOrControl+${index + 1}`,
          click: () => {
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

function createTray(create) {
  try {
    tray?.destroy();
    if (!create) {
      if (app.dock) {
        app.dock.show();
      }
      return Promise.resolve('Tray removed');
    }

    const files = configStorage.get('files') as File[] || [];
    const menu = Menu.buildFromTemplate(getMenuTemplate(files));

    tray = new Tray(getAssetPath('icons/tray/tray.png'));
    tray.setContextMenu(menu);
    tray.on('click', (event) => {
        if (mainWindow) {
          mainWindow?.show();
        } else {
          createWindow()
            .then((result) => {
              console.log('main.ts:', result);
            })
            .catch((error) => {
              console.error('main.ts:', error);
            });
        }
    });

    return Promise.resolve('Tray created');
  } catch (error) {
    console.error('Error creating tray:', error);
    return Promise.reject(error);
  }
}

export { createTray };
