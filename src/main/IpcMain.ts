import { ipcMain, app, IpcMainEvent, clipboard, shell } from "electron";
import { dataRequest } from "./DataRequest/DataRequest";
import { changeCompleteState } from "./DataRequest/ChangeCompleteState";
import { writeSingleTodoToFile, removeLineFromFile } from "./File/Write";
import { archiveTodos, checkArchiveReadiness } from "./File/Archive";
import { SettingsStore, FiltersStore, NotificationsStore } from "./Stores";
import { HandleError } from "./Shared";
import { registerTodoFile, activateFile, removeFile } from "./File/File";
import { openFile, createFile } from "./File/Dialog";
import { createTodoObject } from "./DataRequest/CreateTodoObjects";

function handleDataRequest(event: IpcMainEvent, searchString: string) {
  try {
    const requestedData = dataRequest(searchString);
    event.reply("requestData", requestedData);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
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
  } catch (error) {
    if (error instanceof Error) HandleError(error);
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
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleWriteTodoToFile(
  _: IpcMainEvent,
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
      writeSingleTodoToFile(index, todoObject.string, state);
    } else {
      let updatedString: string | null = string;
      if (state !== undefined && index >= 0)
        updatedString = changeCompleteState(string, state);
      writeSingleTodoToFile(index, updatedString, state);
    }
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = SettingsStore.get(value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleStoreSetConfig(_: IpcMainEvent, key: string, value: unknown) {
  try {
    SettingsStore.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleStoreSetFilters(
  _: IpcMainEvent,
  key: string,
  value: unknown,
): void {
  try {
    FiltersStore.set(key, value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = FiltersStore.get(value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleStoreSetNotifiedTodoObjects(
  _: IpcMainEvent,
  value: unknown,
): void {
  try {
    NotificationsStore.set("notificationHashes", value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleSetFile(_: IpcMainEvent, index: number): void {
  try {
    activateFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleRemoveFile(_: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleAddFile(_: IpcMainEvent, filePath: string): void {
  try {
    registerTodoFile(filePath, null);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleRevealInFileManager(
  _: IpcMainEvent,
  pathToReveal: string,
): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

async function handleOpenFile(
  _: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await openFile(setDoneFile);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

async function handleCreateFile(
  _: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await createFile(setDoneFile);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleRemoveLineFromFile(_: IpcMainEvent, index: number) {
  try {
    removeLineFromFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const archivingResult = archiveTodos();
    event.reply("responseFromMainProcess", archivingResult);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    event.reply("responseFromMainProcess", "Copied to clipboard: " + string);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleOpenInBrowser(_: IpcMainEvent, url: string): void {
  try {
    shell?.openExternal(url);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
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
  ipcMain.off("writeSingleTodoToFile", handleWriteTodoToFile);
  ipcMain.off("archiveTodos", handleArchiveTodos);
  ipcMain.off("addFile", handleAddFile);
  ipcMain.off("saveToClipboard", handleSaveToClipboard);
  ipcMain.off("revealInFileManager", handleRevealInFileManager);
  ipcMain.off("removeLineFromFile", handleRemoveLineFromFile);
  ipcMain.off("updateTodoObject", handleUpdateTodoObject);
  ipcMain.off("requestArchive", checkArchiveReadiness);
}

app.on("before-quit", () => removeEventListeners());

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
ipcMain.on("writeSingleTodoToFile", handleWriteTodoToFile);
ipcMain.on("archiveTodos", handleArchiveTodos);
ipcMain.on("addFile", handleAddFile);
ipcMain.on("saveToClipboard", handleSaveToClipboard);
ipcMain.on("revealInFileManager", handleRevealInFileManager);
ipcMain.on("removeLineFromFile", handleRemoveLineFromFile);
ipcMain.on("updateTodoObject", handleUpdateTodoObject);
ipcMain.on("requestArchive", checkArchiveReadiness);
