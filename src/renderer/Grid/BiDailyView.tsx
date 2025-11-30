import React, { memo, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Row from './Row'
import EnergyView from './EnergyView'
import ViewModeSwitcher, { ViewMode } from './ViewModeSwitcher'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './BiDailyView.scss'

interface UnitColumnProps {
  title: string
  dateRange: string | null
  isCurrentUnit: boolean
  todoObjects: TodoObject[]
  filters: Filters | null
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
  viewMode: ViewMode
  unitType?: string
}

const UnitColumn: React.FC<UnitColumnProps> = memo(({
  title,
  dateRange,
  isCurrentUnit,
  todoObjects,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
  viewMode,
  unitType
}) => {
  // Filter tasks based on view mode
  const getVisibleTasks = () => {
    if (viewMode === 'batch') {
      // In batch mode, only show D priority tasks
      return todoObjects.filter(todo => todo.priority === 'D')
    }
    return todoObjects
  }

  const visibleTasks = getVisibleTasks()
  const hiddenCount = todoObjects.length - visibleTasks.length

  // Get row class based on view mode and priority
  const getRowClass = (priority: string | null) => {
    if (viewMode === 'focus' && priority !== 'A') {
      return 'dimmed'
    }
    if (viewMode === 'batch' && priority === 'D') {
      return 'highlighted'
    }
    return ''
  }

  return (
    <Paper
      className={`unit-column ${isCurrentUnit ? 'current-unit' : ''} mode-${viewMode}`}
      elevation={isCurrentUnit ? 4 : 1}
    >
      <Box className="unit-header">
        <Box className="unit-header-top">
          <Typography variant="h6" className="unit-title">
            {title}
          </Typography>
          {dateRange && (
            <Typography variant="caption" className="unit-date-range">
              {dateRange}
            </Typography>
          )}
        </Box>
        {unitType && unitType !== 'REST' && (
          <EnergyView unitType={unitType} compact />
        )}
        <Typography variant="caption" className="unit-count">
          {visibleTasks.length} 项任务
          {hiddenCount > 0 && viewMode === 'batch' && (
            <span className="hidden-count"> (+{hiddenCount} 隐藏)</span>
          )}
        </Typography>
      </Box>
      <Divider />
      <List className={`unit-list mode-${viewMode}`}>
        {visibleTasks.length === 0 ? (
          <Typography className="empty-message" variant="body2" color="text.secondary">
            {viewMode === 'batch' ? '无琐事任务' : '暂无任务'}
          </Typography>
        ) : (
          visibleTasks.map((todoObject) => (
            <div
              key={todoObject.lineNumber}
              className={`row-wrapper ${getRowClass(todoObject.priority)}`}
            >
              <Row
                todoObject={todoObject}
                filters={filters}
                setTodoObject={setTodoObject}
                setDialogOpen={setDialogOpen}
                setContextMenu={setContextMenu}
                setPromptItem={setPromptItem}
                settings={settings}
              />
            </div>
          ))
        )}
      </List>
    </Paper>
  )
})

UnitColumn.displayName = 'UnitColumn'

interface RestDayViewProps {
  t: typeof i18n.t
  onReview?: (unitType: string) => void
}

const RestDayView: React.FC<RestDayViewProps> = memo(({ t, onReview }) => {
  return (
    <Box className="rest-day-view">
      <Paper className="rest-day-card" elevation={3}>
        <Typography variant="h3" className="rest-emoji">
          🌴
        </Typography>
        <Typography variant="h4" className="rest-title">
          休息与复盘
        </Typography>
        <Typography variant="body1" className="rest-subtitle">
          今天是周六，放松一下。
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box className="rest-suggestions">
          <Typography variant="h6">建议活动：</Typography>
          <ul>
            <li>📋 回顾本周完成的任务</li>
            <li>🎯 规划下周的重点目标</li>
            <li>🧹 整理待办清单，归档已完成项目</li>
            <li>☕ 享受一杯咖啡，放松身心</li>
          </ul>
        </Box>
        {onReview && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box className="review-section">
              <Typography variant="h6" sx={{ mb: 1 }}>复盘本周各周期：</Typography>
              <ButtonGroup variant="outlined" size="small" className="review-buttons">
                <Button onClick={() => onReview('A')}>复盘 A</Button>
                <Button onClick={() => onReview('B')}>复盘 B</Button>
                <Button onClick={() => onReview('C')}>复盘 C</Button>
              </ButtonGroup>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  )
})

RestDayView.displayName = 'RestDayView'

interface BiDailyViewComponentProps extends WithTranslation {
  todoData: TodoData | null
  filters: Filters | null
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
  isRestDay: boolean
  onReview?: (unitType: string) => void
  t: typeof i18n.t
}

const BiDailyViewComponent: React.FC<BiDailyViewComponentProps> = memo(({
  todoData,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
  isRestDay,
  onReview,
  t
}) => {
  // View mode state: 'normal' | 'focus' | 'batch'
  const [viewMode, setViewMode] = useState<ViewMode>('normal')

  // Find the current unit for the EnergyView
  const currentUnit = todoData?.find(group => group.isCurrentUnit)?.unitType || 'A'

  // Show rest day view on Saturday
  if (isRestDay) {
    return <RestDayView t={t} onReview={onReview} />
  }

  if (!todoData || todoData.length === 0) {
    return (
      <Box className="bidaily-empty">
        <Typography variant="body1">暂无任务数据</Typography>
      </Box>
    )
  }

  // Separate main units (A, B, C) from backlog
  const mainUnits = todoData.filter(group =>
    group.unitType && ['A', 'B', 'C'].includes(group.unitType)
  )
  const backlog = todoData.find(group => group.unitType === 'REST')

  return (
    <Box className={`bidaily-view mode-${viewMode}`}>
      {/* Energy View Header with View Mode Switcher */}
      <Box className="bidaily-header">
        <Box className="bidaily-energy-bar">
          <EnergyView unitType={currentUnit} />
        </Box>
        <ViewModeSwitcher
          currentMode={viewMode}
          onModeChange={setViewMode}
        />
      </Box>

      <Box className="bidaily-columns">
        {mainUnits.map((group) => (
          <UnitColumn
            key={group.unitType}
            title={group.title}
            dateRange={group.dateRange}
            isCurrentUnit={group.isCurrentUnit || false}
            todoObjects={group.todoObjects}
            filters={filters}
            setDialogOpen={setDialogOpen}
            setContextMenu={setContextMenu}
            setTodoObject={setTodoObject}
            setPromptItem={setPromptItem}
            settings={settings}
            viewMode={viewMode}
            unitType={group.unitType}
          />
        ))}
      </Box>

      {backlog && backlog.todoObjects.length > 0 && (
        <Box className="bidaily-backlog">
          <UnitColumn
            title={backlog.title}
            dateRange={null}
            isCurrentUnit={false}
            todoObjects={backlog.todoObjects}
            filters={filters}
            setDialogOpen={setDialogOpen}
            setContextMenu={setContextMenu}
            setTodoObject={setTodoObject}
            setPromptItem={setPromptItem}
            settings={settings}
            viewMode={viewMode}
            unitType="REST"
          />
        </Box>
      )}
    </Box>
  )
})

BiDailyViewComponent.displayName = 'BiDailyViewComponent'

export default withTranslation()(BiDailyViewComponent)
