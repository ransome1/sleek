import { IpcMainEvent, clipboard, shell } from "electron";
import { dataRequest } from "./DataRequest/DataRequest";
import { changeCompleteState } from "./DataRequest/ChangeCompleteState";
import { writeSingleTodoToFile, removeLineFromFile } from "./File/Write";
import { archiveTodos, checkArchiveReadiness } from "./File/Archive";
import {
  SettingsStore,
  FiltersStore,
  ColorsStore,
  NotificationsStore,
} from "./Stores";
import { HandleError } from "./Shared";
import { registerTodoFile, activateFile, removeFile } from "./File/File";
import { openFile, createFile } from "./File/Dialog";
import { createTodoObject } from "./DataRequest/CreateTodoObjects";
import i18n from "./i18n";

export function handleDataRequest(event: IpcMainEvent, searchString: string) {
  try {
    const requestedData = dataRequest(searchString);
    event.reply("requestData", requestedData);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleUpdateAttributeFields(
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

export function handleUpdateTodoObject(
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

export function handleWriteTodoToFile(
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

export function handleStoreGetConfig(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = SettingsStore.get(value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleStoreSetConfig(_: IpcMainEvent, key: string, value: unknown) {
  try {
    SettingsStore.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleStoreSetFilters(
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

export function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = FiltersStore.get(value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleStoreSetNotifiedTodoObjects(
  _: IpcMainEvent,
  value: unknown,
): void {
  try {
    NotificationsStore.set("notificationHashes", value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleStoreGetColors(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = ColorsStore.get(value);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleSetFile(_: IpcMainEvent, index: number): void {
  try {
    activateFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleRemoveFile(_: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleAddFile(_: IpcMainEvent, filePath: string): void {
  try {
    registerTodoFile(filePath, null);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleRevealInFileManager(
  _: IpcMainEvent,
  pathToReveal: string,
): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export async function handleOpenFile(
  _: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await openFile(setDoneFile);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export async function handleCreateFile(
  _: IpcMainEvent,
  setDoneFile: boolean,
): Promise<void> {
  try {
    await createFile(setDoneFile);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleRemoveLineFromFile(_: IpcMainEvent, index: number) {
  try {
    removeLineFromFile(index);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const archivingResult = archiveTodos();
    event.reply("responseFromMainProcess", archivingResult);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string);
    event.reply(
      "responseFromMainProcess",
      i18n.t("clipboard.copied", {
        value: string,
      }),
    );
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleOpenInBrowser(_: IpcMainEvent, url: string): void {
  try {
    shell?.openExternal(url);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

// ─── IPC Handler Registration ──────────────────────────────────────
// Handlers are registered via the registry in IpcHandlers.ts
// Import and initialize in main/index.ts

export { registerAllHandlers, unregisterAllHandlers, checkArchiveReadiness } from "./IpcHandlers.js";
