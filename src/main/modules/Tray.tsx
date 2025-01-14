import { app, Menu, Tray, nativeImage } from 'electron';
import { fileURLToPath } from 'url';
import { handleCreateWindow } from '../index';
import { config } from '../config';
import { setFile } from './File/File';
import trayIcon from '../../../resources/tray/tray.png?asset'

let tray: Tray;

function createMenuTemplate(files: FileObject[]): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: 'Show sleek',
      click: () => {
        handleCreateWindow();
      },
    },
    { type: 'separator' },
    ...(files?.length > 0
      ? files.map((file: FileObject, index: number) => ({
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
  tray?.destroy();

  if(!config.get('tray')) {
    app.dock?.show();
    return;
  }

  const files: FileObject[] = config.get('files');
  const menu: Electron.Menu = Menu.buildFromTemplate(createMenuTemplate(files));
  tray = new Tray(nativeImage.createFromPath(trayIcon))
  tray.setToolTip('sleek');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    handleCreateWindow();
  });
}

export { createTray };
