import React, { memo, useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import dayjs, { Dayjs } from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import Row from './Row'
import './CalendarView.scss'

dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const { ipcRenderer } = window.api

interface CalendarViewProps extends WithTranslation {
  todoData: TodoData | null
  filters: Filters | null
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
  t: typeof i18n.t
}

interface DayCell {
  date: Dayjs
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  tasks: TodoObject[]
  unitType: string | null // BiDaily unit (A, B, C)
}

// Get BiDaily unit type for a given date
const getUnitType = (date: Dayjs): string | null => {
  const dayOfWeek = date.day() // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 6) return null // Saturday is rest day
  if (dayOfWeek === 0 || dayOfWeek === 1) return 'A' // Sun-Mon
  if (dayOfWeek === 2 || dayOfWeek === 3) return 'B' // Tue-Wed
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'C' // Thu-Fri
  return null
}

// Priority colors
const priorityColors: Record<string, string> = {
  'A': '#e63946',
  'B': '#f4a261',
  'C': '#2a9d8f',
  'D': '#6c757d'
}

const CalendarView: React.FC<CalendarViewProps> = memo(({
  todoData,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
  t
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Flatten all tasks from todoData
  const allTasks = useMemo(() => {
    if (!todoData) return []
    return todoData.flatMap(group => group.todoObjects || [])
  }, [todoData])

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TodoObject[]>()
    allTasks.forEach(task => {
      if (task.due) {
        const dateKey = task.due
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push(task)
      }
    })
    return map
  }, [allTasks])

  // Generate calendar days for the current month
  const calendarDays = useMemo((): DayCell[][] => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDate = startOfMonth.startOf('week')
    const endDate = endOfMonth.endOf('week')

    const weeks: DayCell[][] = []
    let currentDate = startDate

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const week: DayCell[] = []
      for (let i = 0; i < 7; i++) {
        const dateKey = currentDate.format('YYYY-MM-DD')
        week.push({
          date: currentDate,
          isCurrentMonth: currentDate.month() === currentMonth.month(),
          isToday: currentDate.isSame(dayjs(), 'day'),
          isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
          tasks: tasksByDate.get(dateKey) || [],
          unitType: getUnitType(currentDate)
        })
        currentDate = currentDate.add(1, 'day')
      }
      weeks.push(week)
    }
    return weeks
  }, [currentMonth, tasksByDate])

  // Handle navigation
  const goToPreviousMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'))
  const goToNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'))
  const goToToday = () => {
    setCurrentMonth(dayjs())
    setSelectedDate(dayjs())
  }

  // Handle date click
  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date)
  }

  // Handle add task on date
  const handleAddTask = (date: Dayjs) => {
    // Create a new empty todo object with the due date pre-filled
    setTodoObject({
      lineNumber: -1,
      string: `due:${date.format('YYYY-MM-DD')}`,
      body: '',
      complete: false,
      priority: null,
      due: date.format('YYYY-MM-DD'),
      t: null,
      rec: null,
      hidden: false,
      pm: null,
      projects: [],
      contexts: [],
      tags: {},
      created: null,
      completed: null
    } as TodoObject)
    setDialogOpen(true)
  }

  // Get task count badge color
  const getBadgeColor = (tasks: TodoObject[]): 'error' | 'warning' | 'primary' | 'default' => {
    if (tasks.some(t => t.priority === 'A')) return 'error'
    if (tasks.some(t => t.priority === 'B')) return 'warning'
    if (tasks.length > 0) return 'primary'
    return 'default'
  }

  // Get priority summary for a day
  const getPrioritySummary = (tasks: TodoObject[]) => {
    const summary: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, none: 0 }
    tasks.forEach(task => {
      if (task.priority && summary[task.priority] !== undefined) {
        summary[task.priority]++
      } else {
        summary.none++
      }
    })
    return summary
  }

  // Render selected date's tasks
  const selectedDateTasks = selectedDate
    ? tasksByDate.get(selectedDate.format('YYYY-MM-DD')) || []
    : []

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekDaysCN = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <Box className="calendar-view">
      {/* Calendar Header */}
      <Box className="calendar-header">
        <Box className="calendar-nav">
          <IconButton onClick={goToPreviousMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5" className="calendar-title">
            {currentMonth.format('YYYY年 M月')}
          </Typography>
          <IconButton onClick={goToNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
          <IconButton onClick={goToToday} size="small" title="回到今天">
            <TodayIcon />
          </IconButton>
        </Box>
        <Box className="calendar-legend">
          <span className="legend-item">
            <span className="unit-indicator unit-a">A</span> 周日-周一
          </span>
          <span className="legend-item">
            <span className="unit-indicator unit-b">B</span> 周二-周三
          </span>
          <span className="legend-item">
            <span className="unit-indicator unit-c">C</span> 周四-周五
          </span>
        </Box>
      </Box>

      <Box className="calendar-content">
        {/* Calendar Grid */}
        <Paper className="calendar-grid-container" elevation={1}>
          {/* Week day headers */}
          <Box className="calendar-weekdays">
            {weekDays.map((day, index) => (
              <Box
                key={day}
                className={`weekday-header ${index === 0 || index === 6 ? 'weekend' : ''}`}
              >
                <span className="weekday-en">{day}</span>
                <span className="weekday-cn">{weekDaysCN[index]}</span>
              </Box>
            ))}
          </Box>

          {/* Calendar days */}
          <Box className="calendar-days">
            {calendarDays.map((week, weekIndex) => (
              <Box key={weekIndex} className="calendar-week">
                {week.map((day) => {
                  const prioritySummary = getPrioritySummary(day.tasks)
                  const isSelected = selectedDate?.isSame(day.date, 'day')

                  return (
                    <Box
                      key={day.date.format('YYYY-MM-DD')}
                      className={`calendar-day
                        ${!day.isCurrentMonth ? 'other-month' : ''}
                        ${day.isToday ? 'today' : ''}
                        ${day.isWeekend ? 'weekend' : ''}
                        ${isSelected ? 'selected' : ''}
                        ${day.unitType ? `unit-${day.unitType.toLowerCase()}` : 'rest-day'}
                      `}
                      onClick={() => handleDateClick(day.date)}
                      onDoubleClick={() => handleAddTask(day.date)}
                    >
                      <Box className="day-header">
                        <span className="day-number">{day.date.date()}</span>
                        {day.unitType && (
                          <span className={`unit-badge unit-${day.unitType.toLowerCase()}`}>
                            {day.unitType}
                          </span>
                        )}
                      </Box>

                      {day.tasks.length > 0 && (
                        <Box className="day-tasks">
                          <Box className="priority-dots">
                            {Object.entries(prioritySummary).map(([priority, count]) => (
                              count > 0 && priority !== 'none' && (
                                <Tooltip
                                  key={priority}
                                  title={`${priority}优先级: ${count}项`}
                                  arrow
                                  placement="top"
                                >
                                  <span
                                    className="priority-dot"
                                    style={{ backgroundColor: priorityColors[priority] }}
                                  >
                                    {count}
                                  </span>
                                </Tooltip>
                              )
                            ))}
                          </Box>
                          <Typography variant="caption" className="task-count">
                            {day.tasks.length}项
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Selected date detail panel */}
        <Paper className="calendar-detail-panel" elevation={1}>
          {selectedDate ? (
            <>
              <Box className="detail-header">
                <Typography variant="h6">
                  {selectedDate.format('M月D日')} ({weekDaysCN[selectedDate.day()]})
                </Typography>
                {getUnitType(selectedDate) && (
                  <span className={`unit-tag unit-${getUnitType(selectedDate)?.toLowerCase()}`}>
                    单元 {getUnitType(selectedDate)}
                  </span>
                )}
                <button
                  className="add-task-btn"
                  onClick={() => handleAddTask(selectedDate)}
                >
                  + 添加任务
                </button>
              </Box>

              <Box className="detail-tasks">
                {selectedDateTasks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" className="no-tasks">
                    这一天没有任务，双击日期可快速添加
                  </Typography>
                ) : (
                  <Box className="task-list">
                    {selectedDateTasks.map((task) => (
                      <Box key={task.lineNumber} className="calendar-task-item">
                        <Row
                          todoObject={task}
                          filters={filters}
                          setTodoObject={setTodoObject}
                          setDialogOpen={setDialogOpen}
                          setContextMenu={setContextMenu}
                          setPromptItem={setPromptItem}
                          settings={settings}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box className="detail-placeholder">
              <Typography variant="body1" color="text.secondary">
                点击日期查看任务详情
              </Typography>
              <Typography variant="caption" color="text.secondary">
                双击日期可快速添加任务
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
})

CalendarView.displayName = 'CalendarView'

export default withTranslation()(CalendarView)
