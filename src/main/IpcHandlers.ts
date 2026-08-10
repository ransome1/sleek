import { ipcMain, IpcMainEvent, shell, clipboard } from "electron";
import { changeCompleteState } from "./DataRequest/ChangeCompleteState";
import {
  SettingsStore,
  FiltersStore,
  NotificationsStore,
  ColorsStore,
} from "./Stores";
import { dataRequest, searchString } from "./DataRequest/DataRequest";
import { createTodoObject } from "./DataRequest/CreateTodoObjects";
import { writeSingleTodoToFile, removeLineFromFile } from "./File/Write";
import {
  archiveSingleTodo,
  archiveTodos,
  checkArchiveReadiness,
} from "./File/Archive";
import { activateFile, removeFile, registerTodoFile } from "./File/File";
import { openFile, createFile } from "./File/Dialog";
import { HandleError } from "./Shared";
import { handleRenameFilterValue, handleDeleteFilterValue } from "./IpcMain";
import path from "path";

interface IpcHandlerEntry {
  channel: string;
  handler: Parameters<typeof ipcMain.on>[1];
}

// ─── Store handlers ──────────────────────────────────────────────────────────

function handleStoreGetConfig(event: IpcMainEvent, key?: string): void {
  try {
    if (key) {
      event.returnValue = SettingsStore.get(key);
    } else {
      event.returnValue = SettingsStore.store;
    }
  } catch (error) {
    if (error instanceof Error) HandleError(error);
    event.returnValue = null;
  }
}

function handleStoreSetConfig(
  _: IpcMainEvent,
  key: string,
  value: unknown,
): void {
  try {
    SettingsStore.set(key, value);
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

function handleStoreGetFilters(event: IpcMainEvent, key: string): void {
  try {
    event.returnValue = FiltersStore.get(key);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
    event.returnValue = null;
  }
}

function handleStoreGetColors(event: IpcMainEvent, key: string): void {
  try {
    event.returnValue = ColorsStore.get(key);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
    event.returnValue = null;
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

// ─── File handlers ──────────────────────────────────────────────────────────

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    activateFile(index);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    const result = removeFile(index);
    event.reply("responseFromMainProcess", result);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

async function handleOpenFile(
  event: IpcMainEvent,
  setDoneFile: boolean,
  lineNumber?: number,
): Promise<void> {
  try {
    await openFile(setDoneFile || false, lineNumber);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

async function handleCreateFile(
  event: IpcMainEvent,
  setDoneFile: boolean,
  lineNumber?: number,
): Promise<void> {
  try {
    await createFile(setDoneFile || false, lineNumber);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleAddFile(
  event: IpcMainEvent,
  filePath: string,
  bookmark: string | null,
): void {
  try {
    const result = registerTodoFile(filePath, bookmark || null);
    event.reply("responseFromMainProcess", result);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

// ─── Data handlers ──────────────────────────────────────────────────────────

function handleUpdateAttributeFields(
  event: IpcMainEvent,
  lineNumber: number,
  string: string,
): void {
  try {
    const todoObject = createTodoObject(lineNumber, string);
    event.reply("updateAttributeFields", todoObject);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleDataRequest(event: IpcMainEvent, searchString: string): void {
  try {
    const requestedData = dataRequest(searchString);
    event.reply("requestData", requestedData);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function refreshRequestedData(event: IpcMainEvent): void {
  const requestedData = dataRequest(searchString);
  event.reply("requestData", requestedData);
}

function handleWriteTodoToFile(
  event: IpcMainEvent,
  lineNumber: number,
  content: string,
  isEditMode: boolean,
): void {
  try {
    writeSingleTodoToFile(lineNumber, content, isEditMode);
    refreshRequestedData(event);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRemoveLineFromFile(
  event: IpcMainEvent,
  lineNumber: number,
): void {
  try {
    removeLineFromFile(lineNumber);
    refreshRequestedData(event);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleUpdateTodoObject(
  event: IpcMainEvent,
  lineNumber: number,
  string: string,
  attributeType: string,
  attributeValue: string,
  shouldWrite: boolean = true,
): void {
  try {
    const todoObject = createTodoObject(
      lineNumber,
      string,
      attributeType,
      attributeValue,
    );
    if (lineNumber >= 0 && shouldWrite) {
      writeSingleTodoToFile(lineNumber, todoObject.string, true);
      refreshRequestedData(event);
    }
    event.reply("updateTodoObject", todoObject);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

// ─── Archive handlers ─────────────────────────────────────────────────────

function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const result = archiveTodos();
    refreshRequestedData(event);
    event.reply("responseFromMainProcess", result);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleArchiveSingleTodo(
  event: IpcMainEvent,
  lineNumber: number,
): void {
  try {
    const result = archiveSingleTodo(lineNumber);
    refreshRequestedData(event);
    event.reply("responseFromMainProcess", result);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRequestArchive(event: IpcMainEvent, lineNumber?: number): void {
  try {
    checkArchiveReadiness(lineNumber);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

// ─── System handlers ─────────────────────────────────────────────────────

function handleOpenInBrowser(_: IpcMainEvent, url: string): void {
  try {
    shell.openExternal(url);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, content: string): void {
  try {
    clipboard.writeText(content);
    event.reply("responseFromMainProcess", {
      type: "clipboard",
      translationKey: "clipboard.copied",
      translationParams: { value: content },
    });
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRevealInFileManager(_: IpcMainEvent, filePath: string): void {
  try {
    shell.showItemInFolder(path.normalize(filePath));
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

// ─── Handler registry ────────────────────────────────────────────────────

function handleToggleTodoComplete(
  event: IpcMainEvent,
  lineNumber: number,
  todoString: string,
  completeState: boolean,
): void {
  try {
    const updatedString = changeCompleteState(todoString, completeState);
    writeSingleTodoToFile(lineNumber, updatedString, false);
    refreshRequestedData(event);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

export const ipcHandlers: IpcHandlerEntry[] = [
  {
    channel: "toggleTodoComplete",
    handler: handleToggleTodoComplete,
  },
  {
    channel: "storeGetConfig",
    handler: handleStoreGetConfig,
  },
  {
    channel: "storeSetConfig",
    handler: handleStoreSetConfig,
  },
  {
    channel: "storeSetFilters",
    handler: handleStoreSetFilters,
  },
  {
    channel: "storeGetFilters",
    handler: handleStoreGetFilters,
  },
  {
    channel: "storeGetColors",
    handler: handleStoreGetColors,
  },
  {
    channel: "storeSetNotifiedTodoObjects",
    handler: handleStoreSetNotifiedTodoObjects,
  },
  {
    channel: "setFile",
    handler: handleSetFile,
  },
  {
    channel: "removeFile",
    handler: handleRemoveFile,
  },
  {
    channel: "openFile",
    handler: handleOpenFile,
  },
  {
    channel: "createFile",
    handler: handleCreateFile,
  },
  {
    channel: "updateAttributeFields",
    handler: handleUpdateAttributeFields,
  },
  {
    channel: "openInBrowser",
    handler: handleOpenInBrowser,
  },
  {
    channel: "requestData",
    handler: handleDataRequest,
  },
  {
    channel: "writeSingleTodoToFile",
    handler: handleWriteTodoToFile,
  },
  {
    channel: "archiveTodos",
    handler: handleArchiveTodos,
  },
  {
    channel: "archiveSingleTodo",
    handler: handleArchiveSingleTodo,
  },
  {
    channel: "requestArchive",
    handler: handleRequestArchive,
  },
  {
    channel: "addFile",
    handler: handleAddFile,
  },
  {
    channel: "saveToClipboard",
    handler: handleSaveToClipboard,
  },
  {
    channel: "revealInFileManager",
    handler: handleRevealInFileManager,
  },
  {
    channel: "removeLineFromFile",
    handler: handleRemoveLineFromFile,
  },
  {
    channel: "updateTodoObject",
    handler: handleUpdateTodoObject,
  },
  {
    channel: "renameFilterValue",
    handler: handleRenameFilterValue,
  },
  {
    channel: "deleteFilterValue",
    handler: handleDeleteFilterValue,
  },
];

export function registerAllHandlers(): void {
  for (const { channel, handler } of ipcHandlers) {
    ipcMain.on(channel, handler);
  }
}

export function unregisterAllHandlers(): void {
  for (const { channel, handler } of ipcHandlers) {
    ipcMain.removeListener(channel, handler);
  }
}
