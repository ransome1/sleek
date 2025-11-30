import dayjs, { Dayjs } from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

/**
 * ============================================================================
 * Bi-Daily Unit System
 * ============================================================================
 *
 * A week is divided into three core work units:
 *   - Unit A: Sunday (0) + Monday (1)
 *   - Unit B: Tuesday (2) + Wednesday (3)
 *   - Unit C: Thursday (4) + Friday (5)
 *   - Saturday (6) is a rest day
 *
 * ============================================================================
 */

export type UnitType = 'A' | 'B' | 'C' | 'REST'

export interface BiDailyUnit {
  type: UnitType
  label: string
  labelCN: string
  days: number[]          // Day of week numbers (0=Sunday, 6=Saturday)
  startDate: Dayjs        // Start date of this unit in current week
  endDate: Dayjs          // End date of this unit in current week
  isCurrentUnit: boolean  // Whether today falls in this unit
}

export interface WeekUnits {
  units: BiDailyUnit[]
  currentUnit: UnitType
  isRestDay: boolean
  weekStart: Dayjs        // Sunday of current week
}

/**
 * Unit definitions with their corresponding day-of-week values
 * dayjs uses: 0=Sunday, 1=Monday, ..., 6=Saturday
 */
const UNIT_DEFINITIONS: Record<UnitType, { days: number[], label: string, labelCN: string }> = {
  A: { days: [0, 1], label: 'Unit A (Sun-Mon)', labelCN: '单元 A（周日-周一）' },
  B: { days: [2, 3], label: 'Unit B (Tue-Wed)', labelCN: '单元 B（周二-周三）' },
  C: { days: [4, 5], label: 'Unit C (Thu-Fri)', labelCN: '单元 C（周四-周五）' },
  REST: { days: [6], label: 'Rest Day (Sat)', labelCN: '休息日（周六）' }
}

/**
 * Get the current Bi-Daily Unit based on today's date
 */
export function getCurrentUnit(date: Dayjs = dayjs()): UnitType {
  const dayOfWeek = date.day() // 0=Sunday, 6=Saturday

  if (dayOfWeek === 0 || dayOfWeek === 1) return 'A'
  if (dayOfWeek === 2 || dayOfWeek === 3) return 'B'
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'C'
  return 'REST' // Saturday
}

/**
 * Check if today is a rest day (Saturday)
 */
export function isRestDay(date: Dayjs = dayjs()): boolean {
  return date.day() === 6
}

/**
 * Get the start of the current week (Sunday)
 */
export function getWeekStart(date: Dayjs = dayjs()): Dayjs {
  const dayOfWeek = date.day()
  return date.subtract(dayOfWeek, 'day').startOf('day')
}

/**
 * Calculate the date range for a specific unit in a given week
 */
export function getUnitDateRange(
  unitType: UnitType,
  weekStart: Dayjs
): { startDate: Dayjs; endDate: Dayjs } {
  const definition = UNIT_DEFINITIONS[unitType]
  const days = definition.days

  return {
    startDate: weekStart.add(days[0], 'day'),
    endDate: weekStart.add(days[days.length - 1], 'day')
  }
}

/**
 * Determine which unit a given due date belongs to
 * Returns null if the date is a Saturday (rest day)
 */
export function getUnitForDate(dueDate: string | null): UnitType | null {
  if (!dueDate) return null

  const date = dayjs(dueDate)
  if (!date.isValid()) return null

  return getCurrentUnit(date)
}

/**
 * Get all units for the current week with their date ranges
 */
export function getWeekUnits(date: Dayjs = dayjs()): WeekUnits {
  const weekStart = getWeekStart(date)
  const currentUnit = getCurrentUnit(date)

  const units: BiDailyUnit[] = (['A', 'B', 'C'] as UnitType[]).map((type) => {
    const definition = UNIT_DEFINITIONS[type]
    const { startDate, endDate } = getUnitDateRange(type, weekStart)

    return {
      type,
      label: definition.label,
      labelCN: definition.labelCN,
      days: definition.days,
      startDate,
      endDate,
      isCurrentUnit: currentUnit === type
    }
  })

  return {
    units,
    currentUnit,
    isRestDay: isRestDay(date),
    weekStart
  }
}

/**
 * Check if a due date falls within a specific unit's date range
 */
export function isDateInUnit(dueDate: string | null, unit: BiDailyUnit): boolean {
  if (!dueDate) return false

  const date = dayjs(dueDate)
  if (!date.isValid()) return false

  // Check if date is on or after startDate and on or before endDate
  return (
    (date.isSame(unit.startDate, 'day') || date.isAfter(unit.startDate, 'day')) &&
    (date.isSame(unit.endDate, 'day') || date.isBefore(unit.endDate, 'day'))
  )
}

/**
 * Group todo objects by Bi-Daily Units
 * Returns a map of UnitType -> TodoObject[]
 */
export function groupTodosByUnit(
  todoObjects: TodoObject[],
  weekUnits: WeekUnits
): Map<UnitType, TodoObject[]> {
  const grouped = new Map<UnitType, TodoObject[]>([
    ['A', []],
    ['B', []],
    ['C', []],
    ['REST', []] // Tasks due on Saturday or without due date
  ])

  for (const todo of todoObjects) {
    if (!todo.due) {
      // Tasks without due date go to "REST" (backlog)
      grouped.get('REST')!.push(todo)
      continue
    }

    const todoDate = dayjs(todo.due)
    if (!todoDate.isValid()) {
      grouped.get('REST')!.push(todo)
      continue
    }

    // Check which unit this todo belongs to
    let assigned = false
    for (const unit of weekUnits.units) {
      if (isDateInUnit(todo.due, unit)) {
        grouped.get(unit.type)!.push(todo)
        assigned = true
        break
      }
    }

    // If not in any of this week's units (past or future week)
    if (!assigned) {
      // Past due dates or Saturday dates go to REST/backlog
      if (todoDate.isBefore(weekUnits.weekStart) || todoDate.day() === 6) {
        grouped.get('REST')!.push(todo)
      }
      // Future dates beyond this week - still show in appropriate unit of that week
      // For simplicity, we calculate which unit type it would be
      else {
        const unitType = getUnitForDate(todo.due)
        if (unitType && unitType !== 'REST') {
          grouped.get(unitType)!.push(todo)
        } else {
          grouped.get('REST')!.push(todo)
        }
      }
    }
  }

  return grouped
}

/**
 * Convert grouped todos to TodoData format for rendering
 */
export function createBiDailyTodoData(
  todoObjects: TodoObject[],
  showHidden: boolean = false
): TodoData {
  const weekUnits = getWeekUnits()
  const grouped = groupTodosByUnit(todoObjects, weekUnits)

  const todoData: TodoData = []

  // Add units in order: A, B, C
  for (const unit of weekUnits.units) {
    const todos = grouped.get(unit.type) || []
    const visibleTodos = showHidden ? todos : todos.filter(t => !t.hidden)

    todoData.push({
      title: unit.isCurrentUnit ? `★ ${unit.labelCN}` : unit.labelCN,
      todoObjects: todos,
      visible: visibleTodos.length > 0,
      unitType: unit.type,
      isCurrentUnit: unit.isCurrentUnit,
      dateRange: `${unit.startDate.format('MM/DD')} - ${unit.endDate.format('MM/DD')}`
    })
  }

  // Add REST/Backlog section
  const restTodos = grouped.get('REST') || []
  const visibleRestTodos = showHidden ? restTodos : restTodos.filter(t => !t.hidden)

  if (restTodos.length > 0) {
    todoData.push({
      title: '📦 待分配 / Backlog',
      todoObjects: restTodos,
      visible: visibleRestTodos.length > 0,
      unitType: 'REST',
      isCurrentUnit: false,
      dateRange: null
    })
  }

  return todoData
}

/**
 * Get rest day message for Saturday view
 */
export function getRestDayMessage(): { title: string; subtitle: string } {
  return {
    title: '🌴 休息与复盘',
    subtitle: '今天是周六，放松一下，回顾本周完成的任务，为下周做好准备。'
  }
}
