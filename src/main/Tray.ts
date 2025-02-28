import { app, Menu, Tray, nativeImage, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { handleCreateWindow, mainWindow } from './index'
import { SettingsStore } from './Stores'
import { setFile } from './File/File'
import TrayIconDark from '../../resources/trayDarkTemplate.png?asset'
import TrayIconLight from '../../resources/trayLightTemplate.png?asset'
import TrayIconDarkWin from '../../resources/trayDark.ico?asset'
import TrayIconLightWin from '../../resources/trayLight.ico?asset'

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

function GetTrayIconPath(): string {
  const invertTrayColor: boolean = SettingsStore.get('invertTrayColor');
  if (process.platform === 'win32') {
    if (nativeTheme.shouldUseDarkColors) {
      return invertTrayColor ? TrayIconLightWin : TrayIconDarkWin;
    } else {
      return invertTrayColor ? TrayIconDarkWin : TrayIconLightWin;
    }
  } else {
    if (nativeTheme.shouldUseDarkColors) {
      return invertTrayColor ? TrayIconLight : TrayIconDark;
    } else {
      return invertTrayColor ? TrayIconDark : TrayIconLight;
    }
  }  
}

export function HandleTray(): void {
  if (tray) {
    tray.destroy();
  }

  const showTray: boolean = SettingsStore.get('tray');
  if (!showTray) {
    app.dock?.show();
    return;
  }

  const TrayIconPath: string = GetTrayIconPath();
  tray = new Tray(nativeImage.createFromPath(TrayIconPath));

  if (tray) {
    const files: FileObject[] = SettingsStore.get('files');
    const menu: Electron.Menu = Menu.buildFromTemplate(createTrayMenu(files));
    tray.setToolTip('sleek');
    tray.setContextMenu(menu);
    tray.on('click', (event) => {
      if(!mainWindow) {
        handleCreateWindow();
      } else if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else if(!mainWindow?.isVisible()) {
        mainWindow.show();
      }
    });
  }
}