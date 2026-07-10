import { ipcMain } from "electron";
import {
  handleDataRequest,
  handleUpdateAttributeFields,
  handleUpdateTodoObject,
  handleWriteTodoToFile,
  handleStoreGetConfig,
  handleStoreSetConfig,
  handleStoreSetFilters,
  handleStoreGetFilters,
  handleStoreSetNotifiedTodoObjects,
  handleStoreGetColors,
  handleSetFile,
  handleRemoveFile,
  handleAddFile,
  handleRevealInFileManager,
  handleOpenFile,
  handleCreateFile,
  handleRemoveLineFromFile,
  handleArchiveTodos,
  handleSaveToClipboard,
  handleOpenInBrowser,
, checkArchiveReadiness } from "./IpcMain.js";

/**
 * IPC Handler Registry
 *
 * Central registry for all Electron IPC handlers.
 *
 * Why this exists:
 * - Single source of truth for all handlers
 * - Automatic registration and cleanup
 * - Prevents bugs from duplicate/missing registrations
 *
 * How to add a handler:
 * 1. Define handler in IpcMain.ts with `export`
 * 2. Add to ipcHandlers array below
 * 3. Done! Automatic cleanup on app quit
 */

interface IpcHandlerEntry {
  channel: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any[]) => void | Promise<void>;
}

export const ipcHandlers: IpcHandlerEntry[] = [
  { channel: "storeGetConfig", handler: handleStoreGetConfig },
  { channel: "storeSetConfig", handler: handleStoreSetConfig },
  { channel: "storeSetFilters", handler: handleStoreSetFilters },
  { channel: "storeGetFilters", handler: handleStoreGetFilters },
  { channel: "storeGetColors", handler: handleStoreGetColors },
  { channel: "storeSetNotifiedTodoObjects", handler: handleStoreSetNotifiedTodoObjects },
  { channel: "setFile", handler: handleSetFile },
  { channel: "removeFile", handler: handleRemoveFile },
  { channel: "openFile", handler: handleOpenFile },
  { channel: "createFile", handler: handleCreateFile },
  { channel: "updateAttributeFields", handler: handleUpdateAttributeFields },
  { channel: "openInBrowser", handler: handleOpenInBrowser },
  { channel: "requestData", handler: handleDataRequest },
  { channel: "writeSingleTodoToFile", handler: handleWriteTodoToFile },
  { channel: "archiveTodos", handler: handleArchiveTodos },
  { channel: "addFile", handler: handleAddFile },
  { channel: "saveToClipboard", handler: handleSaveToClipboard },
  { channel: "revealInFileManager", handler: handleRevealInFileManager },
  { channel: "removeLineFromFile", handler: handleRemoveLineFromFile },
  { channel: "requestArchive", handler: checkArchiveReadiness },
  { channel: "updateTodoObject", handler: handleUpdateTodoObject },
];

/**
 * Register all handlers in the registry
 */
export function registerAllHandlers(): void {
  ipcHandlers.forEach(({ channel, handler }) => {
    ipcMain.on(channel, handler);
  });
}

/**
 * Unregister all handlers in the registry
 */
export function unregisterAllHandlers(): void {
  ipcHandlers.forEach(({ channel, handler }) => {
    ipcMain.off(channel, handler);
  });
}