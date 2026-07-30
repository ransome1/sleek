import { ipcMain, IpcMainEvent, shell, clipboard } from "electron";
import { changeCompleteState } from "./DataRequest/ChangeCompleteState";
import {
  SettingsStore,
  FiltersStore,
  NotificationsStore,
  ColorsStore,
} from "./Stores";
import { dataRequest } from "./DataRequest/DataRequest";
import { createTodoObject } from "./DataRequest/CreateTodoObjects";
import { writeSingleTodoToFile, removeLineFromFile } from "./File/Write";
import { archiveTodos, checkArchiveReadiness } from "./File/Archive";
import { activateFile, removeFile, registerTodoFile } from "./File/File";
import { openFile, createFile } from "./File/Dialog";
import { HandleError } from "./Shared";
import { handleRenameFilterValue, handleDeleteFilterValue } from "./IpcMain";
import path from "path";

interface IpcHandlerEntry {
  channel: string;
  handler: (event: IpcMainEvent, ...args: unknown[]) => void;
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
  event: IpcMainEvent,
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
  event: IpcMainEvent,
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
  event: IpcMainEvent,
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
): Promise<void> {
  try {
    await openFile(setDoneFile || false);
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
): Promise<void> {
  try {
    await createFile(setDoneFile || false);
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

function handleWriteTodoToFile(
  event: IpcMainEvent,
  lineNumber: number,
  content: string,
  isEditMode: boolean,
): void {
  try {
    writeSingleTodoToFile(lineNumber, content, isEditMode);
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
    event.reply("responseFromMainProcess", result);
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRequestArchive(event: IpcMainEvent): void {
  try {
    checkArchiveReadiness();
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

// ─── System handlers ─────────────────────────────────────────────────────

function handleOpenInBrowser(event: IpcMainEvent, url: string): void {
  try {
    shell.openExternal(url);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, content: string): void {
  try {
    clipboard.writeText(content);
    event.reply("responseFromMainProcess", "Copied to clipboard");
  } catch (error) {
    if (error instanceof Error) {
      HandleError(error);
      event.reply("responseFromMainProcess", error);
    }
  }
}

function handleRevealInFileManager(
  event: IpcMainEvent,
  filePath: string,
): void {
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
    handler: (event, ...args) => handleToggleTodoComplete(event, ...args),
  },
  {
    channel: "storeGetConfig",
    handler: (event, ...args) => handleStoreGetConfig(event, ...args),
  },
  {
    channel: "storeSetConfig",
    handler: (event, ...args) => handleStoreSetConfig(event, ...args),
  },
  {
    channel: "storeSetFilters",
    handler: (event, ...args) => handleStoreSetFilters(event, ...args),
  },
  {
    channel: "storeGetFilters",
    handler: (event, ...args) => handleStoreGetFilters(event, ...args),
  },
  {
    channel: "storeGetColors",
    handler: (event, ...args) => handleStoreGetColors(event, ...args),
  },
  {
    channel: "storeSetNotifiedTodoObjects",
    handler: (event, ...args) =>
      handleStoreSetNotifiedTodoObjects(event, ...args),
  },
  {
    channel: "setFile",
    handler: (event, ...args) => handleSetFile(event, ...args),
  },
  {
    channel: "removeFile",
    handler: (event, ...args) => handleRemoveFile(event, ...args),
  },
  {
    channel: "openFile",
    handler: (event, ...args) => handleOpenFile(event, ...args),
  },
  {
    channel: "createFile",
    handler: (event, ...args) => handleCreateFile(event, ...args),
  },
  {
    channel: "updateAttributeFields",
    handler: (event, ...args) => handleUpdateAttributeFields(event, ...args),
  },
  {
    channel: "openInBrowser",
    handler: (event, ...args) => handleOpenInBrowser(event, ...args),
  },
  {
    channel: "requestData",
    handler: (event, ...args) => handleDataRequest(event, ...args),
  },
  {
    channel: "writeSingleTodoToFile",
    handler: (event, ...args) => handleWriteTodoToFile(event, ...args),
  },
  {
    channel: "archiveTodos",
    handler: (event, ...args) => handleArchiveTodos(event, ...args),
  },
  {
    channel: "requestArchive",
    handler: (event, ...args) => handleRequestArchive(event, ...args),
  },
  {
    channel: "addFile",
    handler: (event, ...args) => handleAddFile(event, ...args),
  },
  {
    channel: "saveToClipboard",
    handler: (event, ...args) => handleSaveToClipboard(event, ...args),
  },
  {
    channel: "revealInFileManager",
    handler: (event, ...args) => handleRevealInFileManager(event, ...args),
  },
  {
    channel: "removeLineFromFile",
    handler: (event, ...args) => handleRemoveLineFromFile(event, ...args),
  },
  {
    channel: "updateTodoObject",
    handler: (event, ...args) => handleUpdateTodoObject(event, ...args),
  },
  {
    channel: "renameFilterValue",
    handler: (event, ...args) => handleRenameFilterValue(event, ...args),
  },
  {
    channel: "deleteFilterValue",
    handler: (event, ...args) => handleDeleteFilterValue(event, ...args),
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
