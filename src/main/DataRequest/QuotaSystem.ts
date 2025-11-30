import dayjs from 'dayjs'
import { getWeekUnits, getUnitForDate, UnitType } from './BiDailyUnit'
import { SettingsStore } from '../Stores'
import { getActiveFile } from '../File/Active'
import { readFileContent } from '../File/File'
import { createTodoObjects } from './CreateTodoObjects'
import { handleTodoObjectsDates } from '../Filters/Filters'

/**
 * ============================================================================
 * 1-2-3-5 Quota System for Bi-Daily Units
 * ============================================================================
 *
 * Priority quota limits per Bi-Daily Unit:
 *   - (A) Core Challenge: 1 task max
 *   - (B) Key Progress: 2 tasks max
 *   - (C) Standard Tasks: 3 tasks max
 *   - (D) Admin/Batch: 5 tasks max
 *
 * Total: 11 tasks per unit (avg 5.5 per day) - healthy workload
 *
 * ============================================================================
 */

export type Priority = 'A' | 'B' | 'C' | 'D' | null

export interface QuotaLimit {
  priority: Priority
  limit: number
  label: string
  labelCN: string
  emoji: string
  color: string
}

export interface QuotaStatus {
  priority: Priority
  current: number
  limit: number
  remaining: number
  isAtLimit: boolean
  isOverLimit: boolean
}

export interface UnitQuotaStatus {
  unitType: UnitType
  quotas: Map<Priority, QuotaStatus>
  totalTasks: number
  totalLimit: number
}

export interface QuotaValidationResult {
  isValid: boolean
  priority: Priority
  unitType: UnitType
  current: number
  limit: number
  message: string
  messageCN: string
}

/**
 * Quota limits definition following the 1-2-3-5 rule
 */
export const QUOTA_LIMITS: QuotaLimit[] = [
  {
    priority: 'A',
    limit: 1,
    label: 'Core Challenge',
    labelCN: '核心挑战',
    emoji: '🔴',
    color: '#e53935'
  },
  {
    priority: 'B',
    limit: 2,
    label: 'Key Progress',
    labelCN: '重要推进',
    emoji: '🟠',
    color: '#fb8c00'
  },
  {
    priority: 'C',
    limit: 3,
    label: 'Standard Tasks',
    labelCN: '标准任务',
    emoji: '🔵',
    color: '#1e88e5'
  },
  {
    priority: 'D',
    limit: 5,
    label: 'Admin/Batch',
    labelCN: '琐事/批处理',
    emoji: '⚪',
    color: '#78909c'
  }
]

/**
 * Get quota limit for a specific priority
 */
export function getQuotaLimit(priority: Priority): number {
  const quota = QUOTA_LIMITS.find(q => q.priority === priority)
  return quota?.limit ?? Infinity
}

/**
 * Get quota info for a specific priority
 */
export function getQuotaInfo(priority: Priority): QuotaLimit | null {
  return QUOTA_LIMITS.find(q => q.priority === priority) ?? null
}

/**
 * Count tasks by priority within a specific unit's date range
 * Counts ALL tasks (including completed) to prevent gaming the system
 */
export function countTasksByPriorityInUnit(
  todoObjects: TodoObject[],
  targetUnit: UnitType,
  excludeLineNumber?: number  // Exclude current task when editing
): Map<Priority, number> {
  const counts = new Map<Priority, number>([
    ['A', 0],
    ['B', 0],
    ['C', 0],
    ['D', 0],
    [null, 0]
  ])

  const weekUnits = getWeekUnits()
  const unit = weekUnits.units.find(u => u.type === targetUnit)

  if (!unit) return counts

  for (const todo of todoObjects) {
    // Skip the task being edited
    if (excludeLineNumber !== undefined && todo.lineNumber === excludeLineNumber) {
      continue
    }

    // Check if this task belongs to the target unit
    const taskUnit = getUnitForDate(todo.due)

    // Also check if the due date falls within this unit's date range
    if (todo.due) {
      const dueDate = dayjs(todo.due)
      const inUnitRange =
        (dueDate.isSame(unit.startDate, 'day') || dueDate.isAfter(unit.startDate, 'day')) &&
        (dueDate.isSame(unit.endDate, 'day') || dueDate.isBefore(unit.endDate, 'day'))

      if (inUnitRange) {
        const priority = (todo.priority as Priority) || null
        const validPriority = ['A', 'B', 'C', 'D'].includes(priority as string) ? priority : null
        counts.set(validPriority, (counts.get(validPriority) || 0) + 1)
      }
    }
  }

  return counts
}

/**
 * Get current quota status for all priorities in a unit
 */
export function getUnitQuotaStatus(
  todoObjects: TodoObject[],
  unitType: UnitType,
  excludeLineNumber?: number
): UnitQuotaStatus {
  const counts = countTasksByPriorityInUnit(todoObjects, unitType, excludeLineNumber)

  const quotas = new Map<Priority, QuotaStatus>()
  let totalTasks = 0
  let totalLimit = 0

  for (const quotaLimit of QUOTA_LIMITS) {
    const current = counts.get(quotaLimit.priority) || 0
    const limit = quotaLimit.limit

    quotas.set(quotaLimit.priority, {
      priority: quotaLimit.priority,
      current,
      limit,
      remaining: Math.max(0, limit - current),
      isAtLimit: current >= limit,
      isOverLimit: current > limit
    })

    totalTasks += current
    totalLimit += limit
  }

  return {
    unitType,
    quotas,
    totalTasks,
    totalLimit
  }
}

/**
 * Validate if a task can be added/modified based on quota
 */
export function validateQuota(
  priority: Priority,
  dueDate: string | null,
  existingLineNumber?: number  // For edit operations
): QuotaValidationResult {
  // Skip validation if BiDaily view is disabled
  const biDailyViewEnabled = SettingsStore.get('biDailyView') ?? false
  if (!biDailyViewEnabled) {
    return {
      isValid: true,
      priority,
      unitType: 'A',
      current: 0,
      limit: Infinity,
      message: 'Quota validation disabled',
      messageCN: '配额验证已禁用'
    }
  }

  // Get target unit from due date
  const targetUnit = getUnitForDate(dueDate)

  // Tasks without due date or on REST day bypass quota
  if (!targetUnit || targetUnit === 'REST') {
    return {
      isValid: true,
      priority,
      unitType: targetUnit || 'REST',
      current: 0,
      limit: Infinity,
      message: 'No quota for backlog/rest day tasks',
      messageCN: '待办/休息日任务无配额限制'
    }
  }

  // Get priority limit
  const limit = getQuotaLimit(priority)
  if (limit === Infinity) {
    return {
      isValid: true,
      priority,
      unitType: targetUnit,
      current: 0,
      limit: Infinity,
      message: 'No quota limit for this priority',
      messageCN: '此优先级无配额限制'
    }
  }

  // Load current todos and count
  const activeFile = getActiveFile()
  if (!activeFile) {
    return {
      isValid: true,
      priority,
      unitType: targetUnit,
      current: 0,
      limit,
      message: 'No active file',
      messageCN: '无活动文件'
    }
  }

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)
  let todoObjects = createTodoObjects(fileContent)
  todoObjects = handleTodoObjectsDates(todoObjects)

  const quotaStatus = getUnitQuotaStatus(todoObjects, targetUnit, existingLineNumber)
  const status = quotaStatus.quotas.get(priority)

  if (!status) {
    return {
      isValid: true,
      priority,
      unitType: targetUnit,
      current: 0,
      limit,
      message: 'Unknown priority',
      messageCN: '未知优先级'
    }
  }

  const quotaInfo = getQuotaInfo(priority)
  const priorityLabel = quotaInfo?.labelCN || priority

  if (status.isAtLimit) {
    return {
      isValid: false,
      priority,
      unitType: targetUnit,
      current: status.current,
      limit: status.limit,
      message: `${targetUnit} Unit: Priority (${priority}) quota reached (${status.current}/${status.limit}). Lower priority or move to next unit.`,
      messageCN: `${targetUnit} 单元：(${priority}) ${priorityLabel}类任务已达上限 (${status.current}/${status.limit})。请降低优先级或推迟到下一个周期。`
    }
  }

  return {
    isValid: true,
    priority,
    unitType: targetUnit,
    current: status.current,
    limit: status.limit,
    message: `Quota OK: ${status.current + 1}/${status.limit}`,
    messageCN: `配额正常：${status.current + 1}/${status.limit}`
  }
}

/**
 * Get all quota statuses for the current week's units
 */
export function getAllUnitsQuotaStatus(): Map<UnitType, UnitQuotaStatus> {
  const statuses = new Map<UnitType, UnitQuotaStatus>()

  const activeFile = getActiveFile()
  if (!activeFile) return statuses

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)
  let todoObjects = createTodoObjects(fileContent)
  todoObjects = handleTodoObjectsDates(todoObjects)

  const weekUnits = getWeekUnits()

  for (const unit of weekUnits.units) {
    statuses.set(unit.type, getUnitQuotaStatus(todoObjects, unit.type))
  }

  return statuses
}

/**
 * Format quota status for display
 */
export function formatQuotaDisplay(status: QuotaStatus): string {
  const info = getQuotaInfo(status.priority)
  if (!info) return ''

  return `${info.emoji} [${status.priority}]: ${status.current}/${status.limit}`
}

/**
 * Get formatted quota dashboard data for UI
 */
export function getQuotaDashboard(unitType: UnitType): {
  items: Array<{
    priority: Priority
    emoji: string
    label: string
    labelCN: string
    current: number
    limit: number
    color: string
    isAtLimit: boolean
  }>
  total: { current: number; limit: number }
} {
  const activeFile = getActiveFile()
  if (!activeFile) {
    return {
      items: QUOTA_LIMITS.map(q => ({
        priority: q.priority,
        emoji: q.emoji,
        label: q.label,
        labelCN: q.labelCN,
        current: 0,
        limit: q.limit,
        color: q.color,
        isAtLimit: false
      })),
      total: { current: 0, limit: 11 }
    }
  }

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)
  let todoObjects = createTodoObjects(fileContent)
  todoObjects = handleTodoObjectsDates(todoObjects)

  const status = getUnitQuotaStatus(todoObjects, unitType)

  const items = QUOTA_LIMITS.map(q => {
    const quotaStatus = status.quotas.get(q.priority)
    return {
      priority: q.priority,
      emoji: q.emoji,
      label: q.label,
      labelCN: q.labelCN,
      current: quotaStatus?.current ?? 0,
      limit: q.limit,
      color: q.color,
      isAtLimit: quotaStatus?.isAtLimit ?? false
    }
  })

  return {
    items,
    total: {
      current: status.totalTasks,
      limit: status.totalLimit
    }
  }
}
