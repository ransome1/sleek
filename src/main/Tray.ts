import { app, Menu, Tray, nativeImage, nativeTheme } from "electron";
import { HandleCreateWindow, mainWindow } from "./index";
import { GetFileMenuEntries } from "./Menu";
import { SettingsStore } from "./Stores";
import { File } from "../@types";
import { TranslateMain } from "./I18n";
import TrayIconDark from "../../resources/trayDarkTemplate.png?asset";
import TrayIconLight from "../../resources/trayLightTemplate.png?asset";
import TrayIconDarkWin from "../../resources/trayDark.ico?asset";
import TrayIconLightWin from "../../resources/trayLight.ico?asset";

let tray: Tray | null = null;

export function GetTrayImagePath(): string {
  const invertTrayColor = SettingsStore.get("invertTrayColor");
  const isDarkMode = nativeTheme.shouldUseDarkColors;
  const isWindows = process.platform === "win32";

  if (isWindows) {
    const useDark = invertTrayColor ? !isDarkMode : isDarkMode;
    return useDark ? TrayIconDarkWin : TrayIconLightWin;
  } else {
    const useDark = invertTrayColor ? !isDarkMode : isDarkMode;
    return useDark ? TrayIconDark : TrayIconLight;
  }
}

export function CreateTray(): Tray {
  DestroyTray();

  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip("sleek");
  tray.on("click", handleTrayClick);

  UpdateTray();

  return tray;
}

export function DestroyTray(): void {
  tray?.destroy();
  tray = null;
}

export function UpdateTray(): void {
  UpdateTrayImage();
  UpdateTrayMenu();
}

export function UpdateTrayImage(): void {
  if (tray === null) return;
  const imagePath = GetTrayImagePath();
  tray.setImage(nativeImage.createFromPath(imagePath));
}

export function UpdateTrayMenu(): void {
  if (tray === null) return;
  const files: File[] = SettingsStore.get("files");
  const language = SettingsStore.get("language");
  const t = (key: Parameters<typeof TranslateMain>[0]) =>
    TranslateMain(key, language);
  const menu: Electron.Menu = Menu.buildFromTemplate([
    { label: t("menu.showSleek"), click: HandleCreateWindow },
    { type: "separator" },
    ...GetFileMenuEntries(files),
    { type: "separator" },
    { label: t("menu.quitSleek"), click: app.quit },
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
  } else {
    mainWindow.show();
  }
}
