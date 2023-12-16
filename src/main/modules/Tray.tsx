import { app, Menu, Tray } from 'electron';
import { handleCreateWindow } from '../main';
import { configStorage } from '../config';
import { getAssetPath, File } from '../util';
import { setFile } from './File/File';

let tray: Tray;

function createMenuTemplate(files: File[]): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Show sleek',
      click: () => {
        handleCreateWindow();
      },
    },
    { type: 'separator' },
    ...(files?.length > 0
      ? files.map((file: File, index: number) => ({
        label: file.todoFileName!,
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          setFile(index);
          handleCreateWindow();
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
  const isTray = configStorage.get('tray');

  tray?.destroy();

  if(!isTray) {
    app.dock?.show();
    return Promise.resolve('Tray not shown');
  }

  const files = configStorage.get('files') as File[] || [];
  const iconName = process.platform === 'win32' ? 'tray.ico' : 'tray.png';
  const menu = Menu.buildFromTemplate(createMenuTemplate(files));

  tray = new Tray(getAssetPath(`icons/tray/${iconName}`));
  tray.setToolTip('sleek');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    handleCreateWindow();
  });  
}

export { createTray };
