import { app, Menu, Tray, nativeImage, nativeTheme } from 'electron'
import { fileURLToPath } from 'url'
import { HandleCreateWindow, mainWindow } from './index'
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

export function CreateTrayMenu(files: FileObject[]): Electron.MenuItemConstructorOptions[] {
  const fileItems = files.length > 0
    ? files.map((file, index) => ({
        label: file.todoFileName!,
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          setFile(index);
          HandleCreateWindow();
        }
      }))
    : [];

  return [
    { label: 'Show sleek', click: HandleCreateWindow },
    { type: 'separator' },
    ...fileItems,
    { type: 'separator' },
    { label: 'Quit sleek', click: app.quit }
  ];
}

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
    const menu: Electron.Menu = Menu.buildFromTemplate(CreateTrayMenu(files));
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