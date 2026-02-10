import { ipcMain, app, IpcMainEvent, clipboard, shell } from "electron";
import { dataRequest, searchString } from "./DataRequest/DataRequest";
import { mainWindow } from "./index";
import { changeCompleteState } from "./DataRequest/ChangeCompleteState";
import { prepareContentForWriting, removeLineFromFile } from "./File/Write";
import { archiveTodos, handleRequestArchive } from "./File/Archive";
import { SettingsStore, FiltersStore, NotificationsStore } from "./Stores";
import { HandleError } from "./Shared";
import { addFile, setFile, removeFile } from "./File/File";
import { openFile, createFile } from "./File/Dialog";
import { createTodoObject } from "./DataRequest/CreateTodoObjects";

function handleDataRequest(event: IpcMainEvent, searchString: string) {
  try {
    const requestedData = dataRequest(searchString);
    event.reply("requestData", requestedData);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleUpdateAttributeFields(
  event: IpcMainEvent,
  index: number,
  string: string,
) {
  try {
    const todoObject = createTodoObject(index, string);
    event.reply("updateAttributeFields", todoObject);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleUpdateTodoObject(
  event: IpcMainEvent,
  index: number,
  string: string,
  attributeType: string,
  attributeValue: string,
) {
  try {
    const todoObject = createTodoObject(
      index,
      string,
      attributeType,
      attributeValue,
    );
    event.reply("updateTodoObject", todoObject);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleWriteTodoToFile(
  event: IpcMainEvent,
  index: number,
  string: string,
  state: boolean,
  attributeType: string,
  attributeValue: string,
) {
  try {
    if (attributeType && attributeValue) {
      const todoObject = createTodoObject(
        index,
        string,
        attributeType,
        attributeValue,
      );
      prepareContentForWriting(index, todoObject.string);
    } else {
      let updatedString: string | null = string;
      if (state !== undefined && index >= 0)
        updatedString = changeCompleteState(string, state);
      prepareContentForWriting(index, updatedString);
    }
  } catch (error: any) {
    HandleError(error);
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = SettingsStore.get(value);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any) {
  try {
    SettingsStore.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleStoreSetFilters(
  event: IpcMainEvent,
  key: string,
  value: any,
): void {
  try {
    FiltersStore.set(key, value);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = FiltersStore.get(value);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleStoreSetNotifiedTodoObjects(
  event: IpcMainEvent,
  value: any,
): void {
  try {
    NotificationsStore.set("notificationHashes", value);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    setFile(index);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleAddFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleRevealInFileManager(
  event: IpcMainEvent,
  pathToReveal: string,
): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch (error: any) {
    HandleError(error);
  }
}

async function handleOpenFile(
  event: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await openFile(setDoneFile);
  } catch (error: any) {
    HandleError(error);
  }
}

async function handleCreateFile(
  event: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await createFile(setDoneFile);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleRemoveLineFromFile(event: IpcMainEvent, index: number) {
  try {
    removeLineFromFile(index);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const archivingResult = archiveTodos();
    event.reply("responseFromMainProcess", archivingResult);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    event.reply("responseFromMainProcess", "Copied to clipboard: " + string);
  } catch (error: any) {
    HandleError(error);
  }
}

function handleOpenInBrowser(event: IpcMainEvent, url: string): void {
  try {
    shell?.openExternal(url);
  } catch (error: any) {
    HandleError(error);
  }
}

function removeEventListeners(): void {
  ipcMain.off("storeGetConfig", handleStoreGetConfig);
  ipcMain.off("storeSetConfig", handleStoreSetConfig);
  ipcMain.off("storeSetFilters", handleStoreSetFilters);
  ipcMain.off("storeGetFilters", handleStoreGetFilters);
  ipcMain.off("storeSetNotifiedTodoObjects", handleStoreSetNotifiedTodoObjects);
  ipcMain.off("setFile", handleSetFile);
  ipcMain.off("removeFile", handleRemoveFile);
  ipcMain.off("openFile", handleOpenFile);
  ipcMain.off("createFile", handleCreateFile);
  ipcMain.off("updateAttributeFields", handleUpdateAttributeFields);
  ipcMain.off("openInBrowser", handleOpenInBrowser);
  ipcMain.off("requestData", handleDataRequest);
  ipcMain.off("writeTodoToFile", handleWriteTodoToFile);
  ipcMain.off("archiveTodos", handleArchiveTodos);
  ipcMain.off("addFile", handleAddFile);
  ipcMain.off("saveToClipboard", handleSaveToClipboard);
  ipcMain.off("revealInFileManager", handleRevealInFileManager);
  ipcMain.off("removeLineFromFile", handleRemoveLineFromFile);
  ipcMain.off("updateTodoObject", handleUpdateTodoObject);
  ipcMain.off("requestArchive", handleRequestArchive);
}

app.on("before-quit", () => removeEventListeners);

ipcMain.on("storeGetConfig", handleStoreGetConfig);
ipcMain.on("storeSetConfig", handleStoreSetConfig);
ipcMain.on("storeSetFilters", handleStoreSetFilters);
ipcMain.on("storeGetFilters", handleStoreGetFilters);
ipcMain.on("storeSetNotifiedTodoObjects", handleStoreSetNotifiedTodoObjects);
ipcMain.on("setFile", handleSetFile);
ipcMain.on("removeFile", handleRemoveFile);
ipcMain.on("openFile", handleOpenFile);
ipcMain.on("createFile", handleCreateFile);
ipcMain.on("updateAttributeFields", handleUpdateAttributeFields);
ipcMain.on("openInBrowser", handleOpenInBrowser);
ipcMain.on("requestData", handleDataRequest);
ipcMain.on("writeTodoToFile", handleWriteTodoToFile);
ipcMain.on("archiveTodos", handleArchiveTodos);
ipcMain.on("addFile", handleAddFile);
ipcMain.on("saveToClipboard", handleSaveToClipboard);
ipcMain.on("revealInFileManager", handleRevealInFileManager);
ipcMain.on("removeLineFromFile", handleRemoveLineFromFile);
ipcMain.on("updateTodoObject", handleUpdateTodoObject);
ipcMain.on("requestArchive", handleRequestArchive);
