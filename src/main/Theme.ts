import { nativeTheme } from "electron";
import { SettingsStore } from "./Stores";
import { HandleError } from "./Shared";
import { UpdateTrayImage } from "./Tray";

nativeTheme.on("updated", (): void => {
  try {
    if (nativeTheme.themeSource === "system") {
      SettingsStore.set("shouldUseDarkColors", nativeTheme.shouldUseDarkColors);
    } else if (nativeTheme.themeSource === "dark") {
      SettingsStore.set("shouldUseDarkColors", true);
    } else {
      SettingsStore.set("shouldUseDarkColors", false);
    }
    UpdateTrayImage();
  } catch (error: error) {
    HandleError(error);
  }
});

export function HandleTheme(colorTheme): void {
  if (colorTheme != "dark" && colorTheme != "light" && colorTheme != "system") {
    nativeTheme.themeSource = "system";
  } else {
    nativeTheme.themeSource = colorTheme;
  }
  // Sync immediately rather than waiting for the "updated" event, which is not
  // guaranteed to fire if themeSource was already set to this value.
  SettingsStore.set("shouldUseDarkColors", nativeTheme.shouldUseDarkColors);
}
