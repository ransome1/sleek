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
 * A scientifically-grounded task management system integrating:
 * - Ivy Lee Method (1903): ~6 tasks/day optimal for focused work
 * - Flow State Research (Csikszentmihalyi): Deep focus for complex tasks
 * - Ultradian Rhythms (Kleitman): 90-120min work cycles
 * - Antifragile Principles (Taleb): Buffer time for resilience
 * - Energy Management (Schwartz): Match tasks to energy levels
 *
 * Priority quota limits per Bi-Daily Unit:
 *   - (A) Core Challenge: 1 task max  | ~90-120min deep work | High energy
 *   - (B) Key Progress:   2 tasks max | ~45-60min each       | Medium energy
 *   - (C) Standard Tasks: 3 tasks max | ~25-30min each       | Low-medium energy
 *   - (D) Admin/Batch:    5 tasks max | ~10-15min each       | Any energy level
 *
 * Total: 11 tasks per unit (avg 5.5 per day)
 *
 * Why 5.5 tasks/day is optimal:
 *   1. Aligns with Ivy Lee's proven 6-task recommendation
 *   2. Fits within Miller's Law (7±2 working memory capacity)
 *   3. Leaves ~10% buffer for antifragility
 *   4. Bi-daily period provides 100% time redundancy (Day 1 failure → Day 2 recovery)
 *
 * Research backing:
 *   - McKinsey 2024: Developers spend only 32% time on core work
 *   - GitHub 2024: Focused work teams deliver 47% more features
 *   - Stack Overflow 2024: 78% cite interruptions as #1 productivity blocker
 *
 * See /docs/METHODOLOGY.md for comprehensive theoretical foundations.
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
  // Enhanced fields for energy management & flow state optimization
  energyLevel: 'high' | 'medium' | 'low' | 'any'
  energyLevelCN: string
  durationMinutes: number  // Recommended duration per task
  flowDepth: 'deep' | 'moderate' | 'light' | 'shallow'  // Required focus level
  description: string
  descriptionCN: string
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
 *
 * Design principles:
 * - Barbell Strategy: 1 high-risk/high-reward (A) + 8 stable tasks (C+D)
 * - Energy Matching: Complex tasks → High energy periods
 * - Ultradian Alignment: A tasks fit one 90-min focus block
 * - Antifragile Buffer: D tasks serve as cognitive buffer
 */
export const QUOTA_LIMITS: QuotaLimit[] = [
  {
    priority: 'A',
    limit: 1,
    label: 'Core Challenge',
    labelCN: '核心挑战',
    emoji: '🔴',
    color: '#e53935',
    energyLevel: 'high',
    energyLevelCN: '高能量',
    durationMinutes: 90,
    flowDepth: 'deep',
    description: 'High cognitive load, requires deep focus, significant impact',
    descriptionCN: '高认知负荷，需深度专注，有重大影响'
  },
  {
    priority: 'B',
    limit: 2,
    label: 'Key Progress',
    labelCN: '重要推进',
    emoji: '🟠',
    color: '#fb8c00',
    energyLevel: 'medium',
    energyLevelCN: '中能量',
    durationMinutes: 45,
    flowDepth: 'moderate',
    description: 'Medium complexity, drives project progress',
    descriptionCN: '中等复杂度，推动项目进展'
  },
  {
    priority: 'C',
    limit: 3,
    label: 'Standard Tasks',
    labelCN: '标准任务',
    emoji: '🔵',
    color: '#1e88e5',
    energyLevel: 'low',
    energyLevelCN: '低能量',
    durationMinutes: 25,
    flowDepth: 'light',
    description: 'Routine work, predictable completion',
    descriptionCN: '常规工作，可预期完成'
  },
  {
    priority: 'D',
    limit: 5,
    label: 'Admin/Batch',
    labelCN: '琐事/批处理',
    emoji: '⚪',
    color: '#78909c',
    energyLevel: 'any',
    energyLevelCN: '任意',
    durationMinutes: 10,
    flowDepth: 'shallow',
    description: 'Low cognitive load, can be batched',
    descriptionCN: '低认知负荷，可批量处理'
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
 * Enhanced with energy management and flow state information
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
    // Enhanced fields
    energyLevel: string
    energyLevelCN: string
    durationMinutes: number
    flowDepth: string
    description: string
    descriptionCN: string
  }>
  total: { current: number; limit: number }
  // Methodology summary
  methodology: {
    dailyAverage: number
    ivyLeeComparison: string
    bufferPercent: number
  }
} {
  const activeFile = getActiveFile()
  const methodology = {
    dailyAverage: 5.5,
    ivyLeeComparison: '5.5 vs Ivy Lee 6 (~8% buffer)',
    bufferPercent: 8.3
  }

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
        isAtLimit: false,
        energyLevel: q.energyLevel,
        energyLevelCN: q.energyLevelCN,
        durationMinutes: q.durationMinutes,
        flowDepth: q.flowDepth,
        description: q.description,
        descriptionCN: q.descriptionCN
      })),
      total: { current: 0, limit: 11 },
      methodology
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
      isAtLimit: quotaStatus?.isAtLimit ?? false,
      energyLevel: q.energyLevel,
      energyLevelCN: q.energyLevelCN,
      durationMinutes: q.durationMinutes,
      flowDepth: q.flowDepth,
      description: q.description,
      descriptionCN: q.descriptionCN
    }
  })

  return {
    items,
    total: {
      current: status.totalTasks,
      limit: status.totalLimit
    },
    methodology
  }
}

/**
 * ============================================================================
 * Energy Management & Flow State Utilities
 * ============================================================================
 */

export type EnergyLevel = 'high' | 'medium' | 'low' | 'any'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

/**
 * Get recommended priority based on current time/energy
 *
 * Based on ultradian rhythm research (Kleitman 1950s):
 * - Morning (9-11am): Peak cognitive performance → A tasks
 * - Early afternoon (2-4pm): Good for collaboration → B tasks
 * - Late afternoon (4-6pm): Declining energy → C tasks
 * - Evening/Fragments: Batch processing → D tasks
 */
export function getRecommendedPriority(hour: number = new Date().getHours()): {
  priority: Priority
  reason: string
  reasonCN: string
} {
  // Morning peak: 9-11 AM
  if (hour >= 9 && hour < 11) {
    return {
      priority: 'A',
      reason: 'Morning peak energy - ideal for deep work (90-min focus block)',
      reasonCN: '上午能量高峰 - 适合深度工作（90分钟专注块）'
    }
  }

  // Late morning: 11 AM - 12 PM
  if (hour >= 11 && hour < 12) {
    return {
      priority: 'B',
      reason: 'Pre-lunch window - good for important progress tasks',
      reasonCN: '午前窗口 - 适合重要推进任务'
    }
  }

  // Early afternoon: 2-4 PM
  if (hour >= 14 && hour < 16) {
    return {
      priority: 'B',
      reason: 'Afternoon recovery - suitable for collaborative/progress tasks',
      reasonCN: '下午恢复期 - 适合协作/推进任务'
    }
  }

  // Late afternoon: 4-6 PM
  if (hour >= 16 && hour < 18) {
    return {
      priority: 'C',
      reason: 'Declining energy - handle routine tasks',
      reasonCN: '能量下降期 - 处理常规任务'
    }
  }

  // Post-lunch dip: 12-2 PM
  if (hour >= 12 && hour < 14) {
    return {
      priority: 'D',
      reason: 'Post-lunch energy dip - batch process small tasks',
      reasonCN: '午后低谷期 - 批量处理小任务'
    }
  }

  // Evening/other times
  return {
    priority: 'D',
    reason: 'Off-peak hours - batch administrative tasks',
    reasonCN: '非高峰时段 - 批量处理行政任务'
  }
}

/**
 * Calculate estimated completion time for remaining tasks
 * Based on recommended durations per priority level
 */
export function estimateRemainingTime(unitType: UnitType): {
  totalMinutes: number
  breakdown: { priority: Priority; minutes: number }[]
} {
  const activeFile = getActiveFile()
  if (!activeFile) {
    return { totalMinutes: 0, breakdown: [] }
  }

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)
  let todoObjects = createTodoObjects(fileContent)
  todoObjects = handleTodoObjectsDates(todoObjects)

  const status = getUnitQuotaStatus(todoObjects, unitType)

  let totalMinutes = 0
  const breakdown: { priority: Priority; minutes: number }[] = []

  for (const quotaLimit of QUOTA_LIMITS) {
    const quotaStatus = status.quotas.get(quotaLimit.priority)
    const incompleteTasks = (quotaStatus?.current ?? 0) -
      todoObjects.filter(t =>
        t.complete &&
        t.priority === quotaLimit.priority
      ).length

    if (incompleteTasks > 0) {
      const minutes = incompleteTasks * quotaLimit.durationMinutes
      totalMinutes += minutes
      breakdown.push({
        priority: quotaLimit.priority,
        minutes
      })
    }
  }

  return { totalMinutes, breakdown }
}

/**
 * Get antifragile status for current unit
 * Evaluates buffer utilization and recovery potential
 */
export function getAntifragileStatus(unitType: UnitType): {
  bufferUsed: number  // Percentage of buffer capacity used
  recoveryPotential: 'high' | 'medium' | 'low'
  recommendation: string
  recommendationCN: string
} {
  const weekUnits = getWeekUnits()
  const unit = weekUnits.units.find(u => u.type === unitType)

  if (!unit) {
    return {
      bufferUsed: 0,
      recoveryPotential: 'high',
      recommendation: 'Unable to determine unit status',
      recommendationCN: '无法确定单元状态'
    }
  }

  const today = dayjs()
  const isFirstDay = today.isSame(unit.startDate, 'day')
  const isSecondDay = today.isSame(unit.endDate, 'day')

  const dashboard = getQuotaDashboard(unitType)
  const completionRate = dashboard.total.limit > 0
    ? (dashboard.total.current / dashboard.total.limit) * 100
    : 0

  if (isFirstDay) {
    return {
      bufferUsed: 0,
      recoveryPotential: 'high',
      recommendation: 'Day 1 of unit - full buffer available. Focus on A-priority task.',
      recommendationCN: '单元第1天 - 缓冲充足。专注于A类核心任务。'
    }
  }

  if (isSecondDay) {
    if (completionRate < 50) {
      return {
        bufferUsed: 80,
        recoveryPotential: 'low',
        recommendation: 'Day 2 with low completion - prioritize must-do tasks only.',
        recommendationCN: '第2天完成率低 - 只做必须完成的任务。'
      }
    }
    return {
      bufferUsed: 50,
      recoveryPotential: 'medium',
      recommendation: 'Day 2 - use remaining buffer wisely, avoid overcommitting.',
      recommendationCN: '第2天 - 明智使用剩余缓冲，避免过度承诺。'
    }
  }

  return {
    bufferUsed: 0,
    recoveryPotential: 'high',
    recommendation: 'Outside unit period',
    recommendationCN: '不在单元周期内'
  }
}
