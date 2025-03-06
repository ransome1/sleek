import { app, Menu, Tray, nativeImage, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { HandleCreateWindow, mainWindow } from './index'
import { GetFileMenuEntries } from './Menu'
import { SettingsStore } from './Stores'
import { setFile } from './File/File'
import { File } from '../../Types'
import TrayIconDark from '../../resources/trayDarkTemplate.png?asset'
import TrayIconLight from '../../resources/trayLightTemplate.png?asset'
import TrayIconDarkWin from '../../resources/trayDark.ico?asset'
import TrayIconLightWin from '../../resources/trayLight.ico?asset'

let tray: Tray | null = null;

export function GetTrayIconPath(): string {
  const invertTrayColor = SettingsStore.get('invertTrayColor');
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (process.platform === 'win32') {
    return invertTrayColor ? (isDarkMode ? TrayIconLightWin : TrayIconDarkWin) : (isDarkMode ? TrayIconDarkWin : TrayIconLightWin);
  } else {
    return invertTrayColor ? (isDarkMode ? TrayIconLight : TrayIconDark) : (isDarkMode ? TrayIconDark : TrayIconLight);
  }
}

export function HandleTray(): void {
  tray?.destroy();

  const showTray: boolean = SettingsStore.get('tray');
  if (!showTray) {
    app.dock?.show();
    return false;
  }

  const TrayIconPath: string = GetTrayIconPath();
  tray = new Tray(nativeImage.createFromPath(TrayIconPath));

  if (tray) {
    const files: FileObject[] = SettingsStore.get('files');
    const menu: Electron.Menu = Menu.buildFromTemplate([
      { label: 'Show sleek', click: HandleCreateWindow },
      { type: 'separator' },
      ...GetFileMenuEntries(files),
      { type: 'separator' },
      { label: 'Quit sleek', click: app.quit }
    ]);
    tray.setToolTip('sleek');
    tray.setContextMenu(menu);
    tray.on('click', (event) => {
      if (process.platform === 'darwin') {
        return false;
      } else if(!mainWindow) {
        HandleCreateWindow();
      } else if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else if(!mainWindow?.isVisible()) {
        mainWindow.show();
      }
    });
  }
}