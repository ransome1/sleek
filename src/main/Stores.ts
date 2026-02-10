import Store from "electron-store";
import path from "path";
import crypto from "crypto";
import { dataRequest, searchString } from "./DataRequest/DataRequest";
import { userDataDirectory, HandleError } from "./Shared";
import { mainWindow } from "./index";
import { createFileWatcher } from "./File/Watcher";
import {
  CreateTray,
  DestroyTray,
  UpdateTrayImage,
  UpdateTrayMenu,
} from "./Tray";
import { HandleTheme } from "./Theme";

const distributionChannel = function (): string {
  if (process.env.APPIMAGE) {
    return "AppImage";
  } else if (process.windowsStore) {
    return "Windows Store";
  } else if (process.mas) {
    return "Mac App Store";
  } else if (process.env.SNAP) {
    return "Snap Store";
  } else if (process.env.FLATPAK_ID) {
    return "Flathub";
  } else if (process.env.AUR) {
    return "AUR";
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return "Portable";
  } else {
    return "Misc";
  }
};

const migrations = {
  "2.0.0": (config) => {
    console.log("Creating new default configuration for v2.0.0");
    config.set("sorting", [
      { id: "1", value: "priority", invert: false },
      { id: "2", value: "projects", invert: false },
      { id: "3", value: "contexts", invert: false },
      { id: "4", value: "due", invert: false },
      { id: "5", value: "t", invert: false },
      { id: "6", value: "completed", invert: false },
      { id: "7", value: "created", invert: false },
      { id: "8", value: "rec", invert: false },
      { id: "9", value: "pm", invert: false },
    ]);
    config.set("accordionOpenState", [
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    config.set("files", []);
    config.set("appendCreationDate", false);
    config.set("showCompleted", true);
    config.set("showHidden", false);
    config.set("windowMaximized", false);
    config.set("fileSorting", false);
    config.set("convertRelativeToAbsoluteDates", true);
    config.set("thresholdDateInTheFuture", true);
    config.set("colorTheme", "system");
    config.set("shouldUseDarkColors", false);
    config.set("notificationsAllowed", true);
    config.set("notificationThreshold", 2);
    config.set("showFileTabs", true);
    config.set("isNavigationOpen", true);
    config.set(
      "customStylesPath",
      path.join(userDataDirectory, "customStyles.css"),
    );
    config.set("tray", false);
    config.set("zoom", 100);
    config.set("multilineTextField", false);
    config.set("useMultilineForBulkTodoCreation", false);
    config.set("matomo", true);
  },
  "2.0.1": (config) => {
    console.log("Migrating settings store from 2.0.0 → 2.0.1");
    config.set("anonymousUserId", crypto.randomUUID());
  },
  "2.0.2": (config) => {
    console.log("Migrating settings store from 2.0.1 → 2.0.2");
    config.set("dueDateInTheFuture", true);
  },
  "2.0.4": (config) => {
    console.log("Migrating settings store from 2.0.2 → 2.0.4");
    config.delete("multilineTextField");
    config.delete("isDrawerOpen");
    config.delete("useMultilineForBulkTodoCreation");
    config.set("bulkTodoCreation", false);
    config.set("disableAnimations", false);
  },
  "2.0.10": (config) => {
    console.log("Migrating settings store from 2.0.4 → 2.0.10");
    config.set("useHumanFriendlyDates", false);
    config.set("excludeLinesWithPrefix", null);
  },
  "2.0.12": (config) => {
    console.log("Migrating settings store from 2.0.11 → 2.0.12");
    config.set("channel", distributionChannel());
    config.set("fileWatcherAtomic", 1000);
    config.set("fileWatcherPolling", false);
    config.set("fileWatcherPollingInterval", 100);
  },
  "2.0.13": (config) => {
    console.log("Migrating settings store from 2.0.12 → 2.0.13");
    config.set("weekStart", 1);
    config.delete("fileWatcherAtomic");
    config.delete("fileWatcherPolling");
    config.delete("fileWatcherPollingInterval");
    config.delete("language");
    config.set("chokidarOptions", {
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    });
  },
  "2.0.14": (config) => {
    console.log("Migrating settings store from 2.0.13 → 2.0.14");
    config.set("menuBarVisibility", true);
  },
  "2.0.17": (config) => {
    console.log("Migrating settings store from 2.0.14 → 2.0.17");
    config.set("compact", false);
    config.set("sortCompletedLast", false);
  },
  "2.0.19": (config) => {
    console.log("Migrating settings store from 2.0.17 → 2.0.19");
    config.set("invertTrayColor", false);
    config.set("startMinimized", false);
  },
};

const rerenderDefinition = {
  sorting: true,
  files: true,
  showCompleted: true,
  showHidden: true,
  fileSorting: true,
  thresholdDateInTheFuture: true,
  dueDateInTheFuture: true,
  sortCompletedLast: true,
  notificationThreshold: true,
};

function findChanges(oldValue, newValue) {
  const differences = {};

  for (const key in newValue) {
    if (JSON.stringify(newValue[key]) !== JSON.stringify(oldValue[key])) {
      differences[key] = {
        oldValue: oldValue[key],
        newValue: newValue[key],
      };
      if (rerenderDefinition[key]) {
        const requestedData = dataRequest(searchString);
        mainWindow!.webContents.send("requestData", requestedData);
        return false;
      }
    }
  }
  return differences;
}

export const SettingsStore = new Store<StoreType>({
  cwd: userDataDirectory,
  name: "config",
  migrations,
});

export const FiltersStore = new Store({
  cwd: userDataDirectory,
  name: "filters",
  migrations: {
    "2.0.19": (filters) => {
      console.log("Migrating filter store → 2.0.19");
      filters.set("attributes", {});
    },
  },
});

export const NotificationsStore = new Store({
  cwd: userDataDirectory,
  name: "notificationHashes",
});

SettingsStore.onDidAnyChange((newValue, oldValue) => {
  try {
    if (mainWindow && mainWindow.webContents) {
      findChanges(oldValue, newValue);
      mainWindow.webContents.send("settingsChanged", newValue);
    } else {
      console.warn("The window is not available, skipping setting change.");
    }
  } catch (error: any) {
    HandleError(error);
  }
});

SettingsStore.onDidChange("files", (newValue: FileObject[] | undefined) => {
  try {
    if (!newValue) return false;

    createFileWatcher(newValue);
    UpdateTrayMenu();
  } catch (error: any) {
    HandleError(error);
  }
});

SettingsStore.onDidChange("colorTheme", (colorTheme) => {
  try {
    HandleTheme(colorTheme);
  } catch (error: any) {
    HandleError(error);
  }
});

SettingsStore.onDidChange("menuBarVisibility", (menuBarVisibility) => {
  try {
    mainWindow!.setMenuBarVisibility(menuBarVisibility);
    mainWindow!.setAutoHideMenuBar(!menuBarVisibility);
  } catch (error: any) {
    HandleError(error);
  }
});

SettingsStore.onDidChange("tray", (v: boolean) => {
  try {
    if (v) CreateTray();
    else DestroyTray();
  } catch (error: any) {
    HandleError(error);
  }
});

SettingsStore.onDidChange("invertTrayColor", () => {
  try {
    UpdateTrayImage();
  } catch (error: any) {
    HandleError(error);
  }
});
