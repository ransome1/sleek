import { app, Menu, Tray, nativeImage, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { handleCreateWindow } from './index'
import { SettingsStore } from './Stores'
import { setFile } from './File/File'
import TrayIconDark from '../../resources/trayDarkTemplate.png?asset'
import TrayIconLight from '../../resources/trayLightTemplate.png?asset'

interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}

let tray: Tray | null = null;

function createTrayMenu(files: FileObject[]): Electron.MenuItemConstructorOptions[] {
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

export function HandleTray(): void {

  const showTray: boolean = SettingsStore.get('tray');;
  const invertTrayColor: boolean = SettingsStore.get('invertTrayColor');;

  if (tray) {
    tray.destroy();
  }

  if (!showTray) {
    app.dock?.show();
    return;
  }

  const files: FileObject[] = SettingsStore.get('files');
  const menu: Electron.Menu = Menu.buildFromTemplate(createTrayMenu(files));
  const TrayIcon = (nativeTheme.shouldUseDarkColors && !invertTrayColor) || (!nativeTheme.shouldUseDarkColors && invertTrayColor) ? TrayIconDark : TrayIconLight;
  tray = new Tray(nativeImage.createFromPath(TrayIcon));

  if (tray) {
    tray.setToolTip('sleek');
    tray.setContextMenu(menu);
    tray.on('click', handleCreateWindow);
  }
}