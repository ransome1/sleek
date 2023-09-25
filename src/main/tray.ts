import { app, Tray, Menu, nativeTheme } from 'electron';
import { mainWindow, createWindow } from './main';
import { configStorage } from './config';
import { getAssetPath } from './util';
import { setFile } from './modules/File';

let tray;

function getMenuTemplate(files) {
  const menuTemplate = [
    {
      label: 'Show sleek',
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
    { type: 'separator' },
    ...(files?.length > 0
      ? files.map((file, index) => ({
          label: file.todoFileName,
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

function createTray() {
  try {
    const isDark = nativeTheme.shouldUseDarkColors;
    const isMac = process.platform === 'darwin';
    const isTray = configStorage.get('tray');

    tray?.destroy();

    if (!isTray) {
      if (app.dock) {
        app.dock.show();
      }
      return Promise.resolve('Tray removed');
    }

    const files = configStorage.get('files') as File[] || [];
    const menu = Menu.buildFromTemplate(getMenuTemplate(files));

    tray = new Tray((isDark || isMac) ? getAssetPath('icons/tray/darkTheme/tray.png') : getAssetPath('icons/tray/lightTheme/tray.png'));
    tray.setContextMenu(menu);

    return Promise.resolve('Tray created');
  } catch (error) {
    console.error('Error creating tray:', error);
    return Promise.reject(error);
  }
}

export { createTray };
