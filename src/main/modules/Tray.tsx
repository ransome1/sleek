import { app, Menu, Tray } from 'electron';
import { handleCreateWindow } from '../main';
import { config } from '../config';
import { getAssetPath } from '../util';
import { setFile } from './File/File';

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
  const isTray = config.get('tray');

  tray?.destroy();

  if(!isTray) {
    app.dock?.show();
    return;
  }

  const files: FileObject[] = config.get('files') as FileObject[] || [];
  const iconName: string = process.platform === 'win32' ? 'tray.ico' : 'tray.png';
  const menu: Electron.Menu = Menu.buildFromTemplate(createMenuTemplate(files));

  tray = new Tray(getAssetPath(`icons/tray/${iconName}`));
  tray.setToolTip('sleek');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    handleCreateWindow();
  });
}

export { createTray };
