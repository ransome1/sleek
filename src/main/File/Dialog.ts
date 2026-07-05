import {
  app,
  dialog,
  OpenDialogReturnValue,
  SaveDialogReturnValue,
} from "electron";
import path from "path";
import { registerTodoFile, linkDoneFile } from "./File";
import { writeToFile } from "./Write";
import { SettingsStore } from "../Stores";
import { TranslateMain } from "../I18n";

const dialogFilters = () => {
  const language = SettingsStore.get("language");
  return [
    {
      name: TranslateMain("fileDialog.textFiles", language),
      extensions: ["txt"],
    },
    {
      name: TranslateMain("fileDialog.allFiles", language),
      extensions: ["*"],
    },
  ];
};

async function openFile(setDoneFile: boolean): Promise<void> {
  const result: OpenDialogReturnValue = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: dialogFilters(),
    securityScopedBookmarks: true,
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath: string = result.filePaths[0];
    const bookmark: string | null = result.bookmarks?.[0] || null;

    if (setDoneFile) {
      linkDoneFile(filePath, bookmark);
    } else {
      registerTodoFile(filePath, bookmark);
    }
  }
}

async function createFile(setDoneFile: boolean): Promise<void> {
  const defaultFileName = setDoneFile ? "done.txt" : "todo.txt";
  const result: SaveDialogReturnValue = await dialog.showSaveDialog({
    defaultPath: path.join(app.getPath("documents"), defaultFileName),
    filters: dialogFilters(),
    securityScopedBookmarks: true,
  });

  if (!result.canceled && result.filePath) {
    const filePath: string = result.filePath;
    const bookmark: string | null = result.bookmark || null;

    writeToFile("", filePath);

    if (setDoneFile) {
      linkDoneFile(filePath, bookmark);
    } else {
      registerTodoFile(filePath, bookmark);
    }
  }
}

export { createFile, openFile };
