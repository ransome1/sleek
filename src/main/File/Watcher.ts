import chokidar, { FSWatcher } from "chokidar";
import { app } from "electron";
import { dataRequest, searchString } from "../DataRequest/DataRequest";
import { SettingsStore } from "../Stores";
import { HandleError, userDataDirectory } from "../Shared";
import { CreateMenu } from "../Menu";
import { mainWindow, eventListeners } from "../index";
import { File } from "../../Types";

let watcher: FSWatcher | null = null;

function createFileWatcher(files: File[]): void {
  if (watcher) {
    watcher?.close();
    console.log(`Destroyed old file watcher`);
  }

  const hasActiveEntry = files.some((file) => file.active);
  if (!hasActiveEntry && files.length > 0) {
    files[0].active = true;
    SettingsStore.set("files", files);
  }

  if (process.mas) {
    files.forEach((file) => {
      if (file.todoFileBookmark) {
        app.startAccessingSecurityScopedResource(file.todoFileBookmark);
      }
      if (file.doneFileBookmark) {
        app.startAccessingSecurityScopedResource(file.doneFileBookmark);
      }
    });
  }

  watcher = chokidar.watch(
    files.map((file) => file.todoFilePath),
    SettingsStore.get("chokidarOptions"),
  );

  CreateMenu(files);

  watcher.add(userDataDirectory + "/filters.json");

  watcher
    .on("add", (file) => {
      console.log(`Watching new file: ${file}`);
    })
    .on("change", (file) => {
      try {
        const requestedData = dataRequest(searchString);
        mainWindow!.webContents.send("requestData", requestedData);
        console.log(`${file} has been changed`);
      } catch (error: any) {
        HandleError(error);
      }
    })
    .on("unlink", (file) => {
      console.log(`Unlinked file: ${file}`);
    });

  eventListeners.watcher = watcher;
}

export { createFileWatcher, watcher };
