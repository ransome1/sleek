import { app, Menu, Tray, nativeImage, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { handleCreateWindow } from './index'
import { SettingsStore } from './Stores'
import { setFile } from './File/File'
import TrayIconDark from '../../resources/trayDarkTemplate.png?asset'
import TrayIconLight from '../../resources/trayLightTemplate.png?asset'
//import { mainWindow } from './index.js'

interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}

let tray: Tray | null = null;

function createMenuTemplate(files: FileObject[]): Electron.MenuItemConstructorOptions[] {
  const fileItems = files.length > 0
    ? files.map((file, index) => ({
        label: file.todoFileName!,
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          setFile(index);
          handleCreateWindow();
        }
      }))
    : [];

  return [
    { label: 'Show sleek', click: handleCreateWindow },
    { type: 'separator' },
    ...fileItems,
    { type: 'separator' },
    { label: 'Quit sleek', click: app.quit }
  ];
}

export function HandleTray(showTray: boolean): void {
  if (tray) {
    tray.destroy();
  }

  if (!showTray) {
    app.dock?.show();
    return;
  }

  const files: FileObject[] = SettingsStore.get('files');
  const menu: Electron.Menu = Menu.buildFromTemplate(createMenuTemplate(files));
  const TrayIcon = nativeTheme.shouldUseDarkColors ? TrayIconDark : TrayIconLight;
  tray = new Tray(nativeImage.createFromPath(TrayIcon));

  // mainWindow!.webContents.send('responseFromMainProcess', nativeTheme.shouldUseDarkColors)
  // mainWindow!.webContents.send('responseFromMainProcess', TrayIcon)

  if (tray) {
    tray.setToolTip('sleek');
    tray.setContextMenu(menu);
    tray.on('click', handleCreateWindow);
  }
}