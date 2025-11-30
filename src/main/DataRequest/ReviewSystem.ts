import dayjs, { Dayjs } from 'dayjs'
import { getWeekUnits, getWeekStart, getUnitDateRange, groupTodosByUnit, UnitType, BiDailyUnit } from './BiDailyUnit'
import { SettingsStore } from '../Stores'
import { getActiveFile } from '../File/Active'
import { readFileContent } from '../File/File'
import { createTodoObjects } from './CreateTodoObjects'
import { handleTodoObjectsDates } from '../Filters/Filters'

/**
 * ============================================================================
 * Review System for Bi-Daily Units
 * ============================================================================
 *
 * Provides lightweight review functionality at the end of each unit:
 * - Task completion statistics
 * - Time tracking (via pomodoro/pm field)
 * - Comparison of planned vs completed
 * - Review note generation
 *
 * ============================================================================
 */

export interface UnitReviewStats {
  unitType: UnitType
  unitLabel: string
  dateRange: string

  // Task counts
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  completionRate: number

  // Priority breakdown
  priorityStats: {
    priority: string
    total: number
    completed: number
    label: string
  }[]

  // Time tracking (pomodoro-based)
  totalPomodoros: number
  completedPomodoros: number
  estimatedMinutes: number  // 1 pomodoro = 25 minutes

  // Core challenge (A priority) status
  coreChallenge: {
    exists: boolean
    completed: boolean
    task: string | null
  }
}

export interface ReviewTriggerResult {
  shouldShowReview: boolean
  unitToReview: UnitType | null
  reviewDate: string | null
  reason: 'unit_ended' | 'manual' | 'none'
}

/**
 * Get the previous unit (for review purposes)
 */
export function getPreviousUnit(currentUnit: UnitType): UnitType | null {
  switch (currentUnit) {
    case 'A': return 'C'  // Previous week's C
    case 'B': return 'A'
    case 'C': return 'B'
    case 'REST': return 'C'
    default: return null
  }
}

/**
 * Get the unit that just ended (if we're at the start of a new unit)
 */
export function getJustEndedUnit(date: Dayjs = dayjs()): UnitType | null {
  const dayOfWeek = date.day()
  const hour = date.hour()

  // Check if we're in the "morning" of a new unit (before 10 AM)
  const isMorning = hour < 10

  if (!isMorning) return null

  // Tuesday morning -> Unit A just ended
  if (dayOfWeek === 2) return 'A'
  // Thursday morning -> Unit B just ended
  if (dayOfWeek === 4) return 'B'
  // Saturday morning -> Unit C just ended
  if (dayOfWeek === 6) return 'C'
  // Sunday morning -> Could review the whole week (REST period ended)
  if (dayOfWeek === 0) return 'REST'

  return null
}

/**
 * Check if a review should be triggered
 */
export function checkReviewTrigger(date: Dayjs = dayjs()): ReviewTriggerResult {
  const lastReviewDate = SettingsStore.get('lastReviewDate') as string | null
  const today = date.format('YYYY-MM-DD')

  // Check if we already reviewed today
  if (lastReviewDate === today) {
    return {
      shouldShowReview: false,
      unitToReview: null,
      reviewDate: null,
      reason: 'none'
    }
  }

  const justEndedUnit = getJustEndedUnit(date)

  if (justEndedUnit && justEndedUnit !== 'REST') {
    return {
      shouldShowReview: true,
      unitToReview: justEndedUnit,
      reviewDate: today,
      reason: 'unit_ended'
    }
  }

  return {
    shouldShowReview: false,
    unitToReview: null,
    reviewDate: null,
    reason: 'none'
  }
}

/**
 * Get the date range for a unit to review (handles previous week if needed)
 */
export function getReviewUnitDateRange(
  unitType: UnitType,
  referenceDate: Dayjs = dayjs()
): { startDate: Dayjs; endDate: Dayjs } {
  let weekStart = getWeekStart(referenceDate)

  // If reviewing Unit A on Tuesday, we need last week's Sunday-Monday
  // This is handled by checking if the unit ended before this week started
  const currentDayOfWeek = referenceDate.day()

  // For Unit A review on Tuesday, we're still in the same week
  // For Unit C review on Saturday, the unit just ended
  // Just use current week's date range
  return getUnitDateRange(unitType, weekStart)
}

/**
 * Calculate review statistics for a specific unit
 */
export function calculateUnitReviewStats(
  unitType: UnitType,
  referenceDate: Dayjs = dayjs()
): UnitReviewStats | null {
  const activeFile = getActiveFile()
  if (!activeFile) return null

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)
  let todoObjects = createTodoObjects(fileContent)
  todoObjects = handleTodoObjectsDates(todoObjects)

  const weekUnits = getWeekUnits(referenceDate)
  const grouped = groupTodosByUnit(todoObjects, weekUnits)

  const unitTodos = grouped.get(unitType) || []
  const unit = weekUnits.units.find(u => u.type === unitType)

  if (!unit) return null

  // Calculate basic stats
  const totalTasks = unitTodos.length
  const completedTasks = unitTodos.filter(t => t.complete).length
  const incompleteTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority breakdown
  const priorityLabels: Record<string, string> = {
    'A': '核心挑战',
    'B': '重要推进',
    'C': '标准任务',
    'D': '琐事/批处理'
  }

  const priorityStats = ['A', 'B', 'C', 'D'].map(priority => {
    const priorityTodos = unitTodos.filter(t => t.priority === priority)
    return {
      priority,
      total: priorityTodos.length,
      completed: priorityTodos.filter(t => t.complete).length,
      label: priorityLabels[priority]
    }
  })

  // Time tracking (pomodoro)
  let totalPomodoros = 0
  let completedPomodoros = 0

  for (const todo of unitTodos) {
    const pm = typeof todo.pm === 'string' ? parseInt(todo.pm, 10) : (todo.pm || 0)
    if (!isNaN(pm)) {
      totalPomodoros += pm
      if (todo.complete) {
        completedPomodoros += pm
      }
    }
  }

  // Core challenge (A priority) status
  const aTodos = unitTodos.filter(t => t.priority === 'A')
  const coreChallenge = {
    exists: aTodos.length > 0,
    completed: aTodos.length > 0 && aTodos.every(t => t.complete),
    task: aTodos.length > 0 ? aTodos[0].body : null
  }

  return {
    unitType,
    unitLabel: unit.labelCN,
    dateRange: `${unit.startDate.format('MM/DD')} - ${unit.endDate.format('MM/DD')}`,
    totalTasks,
    completedTasks,
    incompleteTasks,
    completionRate,
    priorityStats,
    totalPomodoros,
    completedPomodoros,
    estimatedMinutes: completedPomodoros * 25,
    coreChallenge
  }
}

/**
 * Generate a review note string for saving to todo.txt
 */
export function generateReviewNote(
  stats: UnitReviewStats,
  userNote: string,
  date: Dayjs = dayjs()
): string {
  const reviewDate = date.format('YYYY-MM-DD')
  const completionEmoji = stats.completionRate >= 80 ? '✅' : stats.completionRate >= 50 ? '🔶' : '❌'

  // Format: review note with metadata tags
  let note = `${completionEmoji} [复盘] ${stats.unitLabel}`

  if (userNote.trim()) {
    note += `: ${userNote.trim()}`
  }

  // Add metadata tags
  note += ` review:${reviewDate}`
  note += ` unit:${stats.unitType}`
  note += ` completed:${stats.completedTasks}/${stats.totalTasks}`
  note += ` rate:${stats.completionRate}%`

  if (stats.totalPomodoros > 0) {
    note += ` pm:${stats.completedPomodoros}/${stats.totalPomodoros}`
  }

  // Mark as completed immediately (it's a record, not a task)
  note = `x ${reviewDate} ${note}`

  return note
}

/**
 * Mark review as completed for today
 */
export function markReviewCompleted(date: Dayjs = dayjs()): void {
  SettingsStore.set('lastReviewDate', date.format('YYYY-MM-DD'))
}

/**
 * Get summary message for review modal
 */
export function getReviewSummaryMessage(stats: UnitReviewStats): {
  title: string
  emoji: string
  message: string
} {
  if (stats.completionRate >= 80) {
    return {
      title: '出色完成！',
      emoji: '🎉',
      message: `你在 ${stats.unitLabel} 完成了 ${stats.completionRate}% 的任务，表现优秀！`
    }
  } else if (stats.completionRate >= 50) {
    return {
      title: '稳步推进',
      emoji: '💪',
      message: `${stats.unitLabel} 完成率 ${stats.completionRate}%，继续加油！`
    }
  } else {
    return {
      title: '需要调整',
      emoji: '🤔',
      message: `${stats.unitLabel} 完成率 ${stats.completionRate}%，下个周期可以考虑减少任务量。`
    }
  }
}
