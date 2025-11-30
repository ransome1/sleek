import React, { memo } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Row from './Row'
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
  settings
}) => {
  return (
    <Paper
      className={`unit-column ${isCurrentUnit ? 'current-unit' : ''}`}
      elevation={isCurrentUnit ? 4 : 1}
    >
      <Box className="unit-header">
        <Typography variant="h6" className="unit-title">
          {title}
        </Typography>
        {dateRange && (
          <Typography variant="caption" className="unit-date-range">
            {dateRange}
          </Typography>
        )}
        <Typography variant="caption" className="unit-count">
          {todoObjects.length} 项任务
        </Typography>
      </Box>
      <Divider />
      <List className="unit-list">
        {todoObjects.length === 0 ? (
          <Typography className="empty-message" variant="body2" color="text.secondary">
            暂无任务
          </Typography>
        ) : (
          todoObjects.map((todoObject) => (
            <Row
              key={todoObject.lineNumber}
              todoObject={todoObject}
              filters={filters}
              setTodoObject={setTodoObject}
              setDialogOpen={setDialogOpen}
              setContextMenu={setContextMenu}
              setPromptItem={setPromptItem}
              settings={settings}
            />
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
    <Box className="bidaily-view">
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
          />
        </Box>
      )}
    </Box>
  )
})

BiDailyViewComponent.displayName = 'BiDailyViewComponent'

export default withTranslation()(BiDailyViewComponent)
