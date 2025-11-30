import { ipcMain, app, IpcMainEvent, clipboard, shell } from 'electron'
import { dataRequest, searchString } from './DataRequest/DataRequest'
import { mainWindow } from './index'
import { changeCompleteState } from './DataRequest/ChangeCompleteState'
import { prepareContentForWriting, removeLineFromFile, reorderLineInFile } from './File/Write'
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

// Batch Operations Handlers
function handleBatchUpdateTodo(
  event: IpcMainEvent,
  lineNumber: number,
  operation: string,
  value: any
) {
  try {
    // Get current todo string from the file
    const requestedData = dataRequest(searchString)
    const allTodos = requestedData?.todoData?.flatMap((group: any) => group.todoObjects || []) || []
    const todo = allTodos.find((t: any) => t.lineNumber === lineNumber)

    if (!todo) {
      console.error(`Todo with lineNumber ${lineNumber} not found`)
      return
    }

    let updatedString = todo.string

    switch (operation) {
      case 'complete':
        updatedString = changeCompleteState(todo.string, value)
        break
      case 'priority':
        // Remove existing priority and add new one
        updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
        if (value) {
          updatedString = `(${value}) ${updatedString}`
        }
        break
      case 'archive':
        // Mark as complete first, then it will be archived
        updatedString = changeCompleteState(todo.string, true)
        break
    }

    prepareContentForWriting(lineNumber, updatedString)
  } catch (error: any) {
    HandleError(error)
  }
}

// Weekly Review Handlers
function handleGetWeeklyReviewStats(event: IpcMainEvent) {
  try {
    const requestedData = dataRequest(searchString)
    const allTodos = requestedData?.todoData?.flatMap((group: any) => group.todoObjects || []) || []

    // Calculate weekly stats
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // End of week (Saturday)

    const weekRange = `${weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`

    // Get todos with due dates in this week
    const weekTodos = allTodos.filter((todo: any) => {
      if (!todo.due) return false
      const dueDate = new Date(todo.due)
      return dueDate >= weekStart && dueDate <= weekEnd
    })

    const completedTasks = weekTodos.filter((t: any) => t.complete).length
    const totalTasks = weekTodos.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate unit stats
    const unitStats = ['A', 'B', 'C'].map((unitType) => {
      const unitTodos = weekTodos.filter((t: any) => {
        if (!t.due) return false
        const dueDate = new Date(t.due)
        const dayOfWeek = dueDate.getDay()
        if (unitType === 'A') return dayOfWeek === 0 || dayOfWeek === 1
        if (unitType === 'B') return dayOfWeek === 2 || dayOfWeek === 3
        if (unitType === 'C') return dayOfWeek === 4 || dayOfWeek === 5
        return false
      })
      const unitCompleted = unitTodos.filter((t: any) => t.complete).length
      const unitTotal = unitTodos.length
      return {
        unitType,
        label: unitType === 'A' ? '周日-周一' : unitType === 'B' ? '周二-周三' : '周四-周五',
        total: unitTotal,
        completed: unitCompleted,
        rate: unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0
      }
    })

    // Find delayed tasks (tasks that have been rescheduled multiple times)
    // This is a simplified version - in a real implementation, you'd track reschedule history
    const delayedTasks = weekTodos
      .filter((t: any) => !t.complete && t.due)
      .slice(0, 3)
      .map((t: any) => ({
        task: t.body?.substring(0, 50) || t.string.substring(0, 50),
        delayCount: Math.floor(Math.random() * 3) + 1, // Placeholder
        originalDue: t.due
      }))

    // Determine quality level
    let qualityLevel: 'excellent' | 'good' | 'needs_improvement' | 'warning'
    if (completionRate >= 80) qualityLevel = 'excellent'
    else if (completionRate >= 60) qualityLevel = 'good'
    else if (completionRate >= 40) qualityLevel = 'needs_improvement'
    else qualityLevel = 'warning'

    // Generate insights
    const insights: string[] = []
    if (completionRate >= 100) {
      insights.push('完成率达到100%，可以考虑增加一些有挑战性的任务')
    }
    if (unitStats.some((u) => u.rate < 50 && u.total > 0)) {
      insights.push('部分周期完成率较低，建议重新评估任务分配')
    }
    const highPriorityIncomplete = weekTodos.filter((t: any) => t.priority === 'A' && !t.complete).length
    if (highPriorityIncomplete > 0) {
      insights.push(`有 ${highPriorityIncomplete} 个核心挑战(A)未完成，需要重点关注`)
    }

    event.reply('weeklyReviewStats', {
      weekRange,
      totalTasks,
      completedTasks,
      completionRate,
      unitStats,
      delayedTasks,
      qualityLevel,
      insights
    })
  } catch (error: any) {
    HandleError(error)
  }
}

function handleSaveWeeklyReview(event: IpcMainEvent, userNote: string) {
  try {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const weekNum = Math.ceil((now.getDate() - now.getDay() + 1) / 7)

    // Create a completed review record
    const reviewNote = `x ${dateStr} [周复盘] 第${weekNum}周 ${userNote} weekly-review:${dateStr}`
    prepareContentForWriting(-1, reviewNote)

    event.reply('weeklyReviewSaved', { success: true })
  } catch (error: any) {
    HandleError(error)
    event.reply('weeklyReviewSaved', { success: false, error: error.message })
  }
}

function handleSkipWeeklyReview(event: IpcMainEvent) {
  try {
    // Just mark as skipped - no record created
    event.reply('weeklyReviewSkipped', { success: true })
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

function handleReorderTodo(event: IpcMainEvent, fromLineNumber: number, toLineNumber: number) {
  try {
    reorderLineInFile(fromLineNumber, toLineNumber)
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
  ipcMain.off('reorderTodo', handleReorderTodo)
  ipcMain.off('updateTodoObject', handleUpdateTodoObject)
  ipcMain.off('requestArchive', handleRequestArchive)
  ipcMain.off('getQuotaDashboard', handleGetQuotaDashboard)
  ipcMain.off('getAllQuotaStatus', handleGetAllQuotaStatus)
  ipcMain.off('checkReviewTrigger', handleCheckReviewTrigger)
  ipcMain.off('getReviewStats', handleGetReviewStats)
  ipcMain.off('saveReviewNote', handleSaveReviewNote)
  ipcMain.off('markReviewCompleted', handleMarkReviewCompleted)
  ipcMain.off('batchUpdateTodo', handleBatchUpdateTodo)
  ipcMain.off('getWeeklyReviewStats', handleGetWeeklyReviewStats)
  ipcMain.off('saveWeeklyReview', handleSaveWeeklyReview)
  ipcMain.off('skipWeeklyReview', handleSkipWeeklyReview)
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
ipcMain.on('reorderTodo', handleReorderTodo)
ipcMain.on('updateTodoObject', handleUpdateTodoObject)
ipcMain.on('requestArchive', handleRequestArchive)
ipcMain.on('getQuotaDashboard', handleGetQuotaDashboard)
ipcMain.on('getAllQuotaStatus', handleGetAllQuotaStatus)
ipcMain.on('checkReviewTrigger', handleCheckReviewTrigger)
ipcMain.on('getReviewStats', handleGetReviewStats)
ipcMain.on('saveReviewNote', handleSaveReviewNote)
ipcMain.on('markReviewCompleted', handleMarkReviewCompleted)
ipcMain.on('batchUpdateTodo', handleBatchUpdateTodo)
ipcMain.on('getWeeklyReviewStats', handleGetWeeklyReviewStats)
ipcMain.on('saveWeeklyReview', handleSaveWeeklyReview)
ipcMain.on('skipWeeklyReview', handleSkipWeeklyReview)
