import { ipcMain, app, IpcMainEvent, clipboard, shell } from 'electron'
import { dataRequest, searchString } from './DataRequest/DataRequest'
import { mainWindow } from './index'
import { changeCompleteState } from './DataRequest/ChangeCompleteState'
import { prepareContentForWriting, removeLineFromFile } from './File/Write'
import { archiveTodos, handleRequestArchive } from './File/Archive'
import { SettingsStore, FiltersStore, NotificationsStore } from './Stores'
import { HandleError } from './Shared'
import { addFile, setFile, removeFile } from './File/File'
import { openFile, createFile } from './File/Dialog'
import { createTodoObject } from './DataRequest/CreateTodoObjects'
import { validateQuota, getQuotaDashboard, getAllUnitsQuotaStatus, Priority } from './DataRequest/QuotaSystem'
import { getCurrentUnit, UnitType } from './DataRequest/BiDailyUnit'
import {
  checkReviewTrigger,
  calculateUnitReviewStats,
  generateReviewNote,
  markReviewCompleted,
  getPreviousUnit
} from './DataRequest/ReviewSystem'

function handleDataRequest(event: IpcMainEvent, searchString: string) {
  try {
    const requestedData = dataRequest(searchString)
    event.reply('requestData', requestedData)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleUpdateAttributeFields(event: IpcMainEvent, index: number, string: string) {
  try {
    const todoObject = createTodoObject(index, string)
    event.reply('updateAttributeFields', todoObject)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleUpdateTodoObject(
  event: IpcMainEvent,
  index: number,
  string: string,
  attributeType: string,
  attributeValue: string
) {
  try {
    const todoObject = createTodoObject(index, string, attributeType, attributeValue)
    event.reply('updateTodoObject', todoObject)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleWriteTodoToFile(
  event: IpcMainEvent,
  index: number,
  string: string,
  state: boolean,
  attributeType: string,
  attributeValue: string
) {
  try {
    // Create todo object to get priority and due date
    const todoObject = createTodoObject(index, string, attributeType, attributeValue)

    // Only validate quota for new tasks or priority/due date changes
    // Skip validation for completion state changes
    if (state === undefined) {
      const priority = (todoObject.priority as Priority) || null
      const dueDate = todoObject.due || null

      // Validate quota before writing
      const validation = validateQuota(priority, dueDate, index >= 0 ? index : undefined)

      if (!validation.isValid) {
        // Send quota exceeded error to renderer
        event.reply('quotaExceeded', {
          message: validation.message,
          messageCN: validation.messageCN,
          priority: validation.priority,
          unitType: validation.unitType,
          current: validation.current,
          limit: validation.limit
        })
        return // Block the write operation
      }
    }

    if (attributeType && attributeValue) {
      prepareContentForWriting(index, todoObject.string)
    } else {
      let updatedString: string | null = string
      if (state !== undefined && index >= 0) updatedString = changeCompleteState(string, state)
      prepareContentForWriting(index, updatedString)
    }
  } catch (error: any) {
    HandleError(error)
  }
}

function handleGetQuotaDashboard(event: IpcMainEvent, unitType?: string) {
  try {
    const unit = unitType || getCurrentUnit()
    const dashboard = getQuotaDashboard(unit as any)
    event.reply('quotaDashboard', dashboard)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleGetAllQuotaStatus(event: IpcMainEvent) {
  try {
    const statuses = getAllUnitsQuotaStatus()
    // Convert Map to object for IPC
    const result: Record<string, any> = {}
    statuses.forEach((value, key) => {
      result[key] = {
        ...value,
        quotas: Object.fromEntries(value.quotas)
      }
    })
    event.reply('allQuotaStatus', result)
  } catch (error: any) {
    HandleError(error)
  }
}

// Review System Handlers
function handleCheckReviewTrigger(event: IpcMainEvent) {
  try {
    const result = checkReviewTrigger()
    event.reply('reviewTriggerResult', result)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleGetReviewStats(event: IpcMainEvent, unitType: string) {
  try {
    const stats = calculateUnitReviewStats(unitType as any)
    event.reply('reviewStats', stats)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleSaveReviewNote(event: IpcMainEvent, unitType: string, userNote: string) {
  try {
    const stats = calculateUnitReviewStats(unitType as any)
    if (stats) {
      const reviewNote = generateReviewNote(stats, userNote)
      // Add to file as a completed task (review record)
      prepareContentForWriting(-1, reviewNote)
      markReviewCompleted()
      event.reply('reviewNoteSaved', { success: true })
    } else {
      event.reply('reviewNoteSaved', { success: false, error: 'No stats available' })
    }
  } catch (error: any) {
    HandleError(error)
    event.reply('reviewNoteSaved', { success: false, error: error.message })
  }
}

function handleMarkReviewCompleted(event: IpcMainEvent) {
  try {
    markReviewCompleted()
    event.reply('reviewMarkedCompleted', { success: true })
  } catch (error: any) {
    HandleError(error)
  }
}

function handleStoreGetConfig(event: IpcMainEvent, value: string) {
  try {
    event.returnValue = SettingsStore.get(value)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any) {
  try {
    SettingsStore.set(key, value)
    console.log(`Set ${key} to ${value}`)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleStoreSetFilters(event: IpcMainEvent, key: string, value: any): void {
  try {
    FiltersStore.set(key, value)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleStoreGetFilters(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = FiltersStore.get(value)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleStoreSetNotifiedTodoObjects(event: IpcMainEvent, value: any): void {
  try {
    NotificationsStore.set('notificationHashes', value)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    setFile(index)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    removeFile(index)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleAddFile(event: IpcMainEvent, filePath: string): void {
  try {
    addFile(filePath, null)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleRevealInFileManager(event: IpcMainEvent, pathToReveal: string): void {
  try {
    shell.showItemInFolder(pathToReveal)
  } catch (error: any) {
    HandleError(error)
  }
}

async function handleOpenFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    await openFile(setDoneFile)
  } catch (error: any) {
    HandleError(error)
  }
}

async function handleCreateFile(event: IpcMainEvent, setDoneFile: boolean): Promise<void> {
  try {
    await createFile(setDoneFile)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleRemoveLineFromFile(event: IpcMainEvent, index: number) {
  try {
    removeLineFromFile(index)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const archivingResult = archiveTodos()
    event.reply('responseFromMainProcess', archivingResult)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {
    clipboard.writeText(string)
    event.reply('responseFromMainProcess', 'Copied to clipboard: ' + string)
  } catch (error: any) {
    HandleError(error)
  }
}

function handleOpenInBrowser(event: IpcMainEvent, url: string): void {
  try {
    shell?.openExternal(url)
  } catch (error: any) {
    HandleError(error)
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGetConfig', handleStoreGetConfig)
  ipcMain.off('storeSetConfig', handleStoreSetConfig)
  ipcMain.off('storeSetFilters', handleStoreSetFilters)
  ipcMain.off('storeGetFilters', handleStoreGetFilters)
  ipcMain.off('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects)
  ipcMain.off('setFile', handleSetFile)
  ipcMain.off('removeFile', handleRemoveFile)
  ipcMain.off('openFile', handleOpenFile)
  ipcMain.off('createFile', handleCreateFile)
  ipcMain.off('updateAttributeFields', handleUpdateAttributeFields)
  ipcMain.off('openInBrowser', handleOpenInBrowser)
  ipcMain.off('requestData', handleDataRequest)
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile)
  ipcMain.off('archiveTodos', handleArchiveTodos)
  ipcMain.off('addFile', handleAddFile)
  ipcMain.off('saveToClipboard', handleSaveToClipboard)
  ipcMain.off('revealInFileManager', handleRevealInFileManager)
  ipcMain.off('removeLineFromFile', handleRemoveLineFromFile)
  ipcMain.off('updateTodoObject', handleUpdateTodoObject)
  ipcMain.off('requestArchive', handleRequestArchive)
  ipcMain.off('getQuotaDashboard', handleGetQuotaDashboard)
  ipcMain.off('getAllQuotaStatus', handleGetAllQuotaStatus)
  ipcMain.off('checkReviewTrigger', handleCheckReviewTrigger)
  ipcMain.off('getReviewStats', handleGetReviewStats)
  ipcMain.off('saveReviewNote', handleSaveReviewNote)
  ipcMain.off('markReviewCompleted', handleMarkReviewCompleted)
}

app.on('before-quit', () => removeEventListeners)

ipcMain.on('storeGetConfig', handleStoreGetConfig)
ipcMain.on('storeSetConfig', handleStoreSetConfig)
ipcMain.on('storeSetFilters', handleStoreSetFilters)
ipcMain.on('storeGetFilters', handleStoreGetFilters)
ipcMain.on('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects)
ipcMain.on('setFile', handleSetFile)
ipcMain.on('removeFile', handleRemoveFile)
ipcMain.on('openFile', handleOpenFile)
ipcMain.on('createFile', handleCreateFile)
ipcMain.on('updateAttributeFields', handleUpdateAttributeFields)
ipcMain.on('openInBrowser', handleOpenInBrowser)
ipcMain.on('requestData', handleDataRequest)
ipcMain.on('writeTodoToFile', handleWriteTodoToFile)
ipcMain.on('archiveTodos', handleArchiveTodos)
ipcMain.on('addFile', handleAddFile)
ipcMain.on('saveToClipboard', handleSaveToClipboard)
ipcMain.on('revealInFileManager', handleRevealInFileManager)
ipcMain.on('removeLineFromFile', handleRemoveLineFromFile)
ipcMain.on('updateTodoObject', handleUpdateTodoObject)
ipcMain.on('requestArchive', handleRequestArchive)
ipcMain.on('getQuotaDashboard', handleGetQuotaDashboard)
ipcMain.on('getAllQuotaStatus', handleGetAllQuotaStatus)
ipcMain.on('checkReviewTrigger', handleCheckReviewTrigger)
ipcMain.on('getReviewStats', handleGetReviewStats)
ipcMain.on('saveReviewNote', handleSaveReviewNote)
ipcMain.on('markReviewCompleted', handleMarkReviewCompleted)
