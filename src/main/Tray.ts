import { app, Menu, Tray, nativeImage, nativeTheme } from "electron";
import { HandleCreateWindow, mainWindow } from "./index";
import { GetFileMenuEntries } from "./Menu";
import { SettingsStore } from "./Stores";
import { File } from "../Types";
import TrayIconDark from "../../resources/trayDarkTemplate.png?asset";
import TrayIconLight from "../../resources/trayLightTemplate.png?asset";
import TrayIconDarkWin from "../../resources/trayDark.ico?asset";
import TrayIconLightWin from "../../resources/trayLight.ico?asset";

let tray: Tray | null = null;

export function GetTrayImagePath(): string {
  const invertTrayColor = SettingsStore.get("invertTrayColor");
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  if (process.platform === "win32") {
    return invertTrayColor
      ? isDarkMode
        ? TrayIconLightWin
        : TrayIconDarkWin
      : isDarkMode
        ? TrayIconDarkWin
        : TrayIconLightWin;
  } else {
    return invertTrayColor
      ? isDarkMode
        ? TrayIconLight
        : TrayIconDark
      : isDarkMode
        ? TrayIconDark
        : TrayIconLight;
  }
}

export function CreateTray(): Tray {
  DestroyTray();

  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip("sleek");
  tray.on("click", handleTrayClick);

  UpdateTrayImage();
  UpdateTrayMenu();

  return tray;
}

export function DestroyTray(): void {
  tray?.destroy();
  tray = null;
}

export function UpdateTrayImage(): void {
  if (tray === null) return;
  const imagePath = GetTrayImagePath();
  tray.setImage(nativeImage.createFromPath(imagePath));
}

export function UpdateTrayMenu(): void {
  if (tray === null) return;
  const files: File[] = SettingsStore.get("files");
  const menu: Electron.Menu = Menu.buildFromTemplate([
    { label: "Show sleek", click: HandleCreateWindow },
    { type: "separator" },
    ...GetFileMenuEntries(files),
    { type: "separator" },
    { label: "Quit sleek", click: app.quit },
  ]);
  tray.setContextMenu(menu);
}

function handleTrayClick(): void {
  if (process.platform === "darwin") {
    return;
  } else if (!mainWindow) {
    HandleCreateWindow();
  } else if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else if (!mainWindow?.isVisible()) {
    mainWindow.show();
  }
}
