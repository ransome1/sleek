import React, { memo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import './ViewModeSwitcher.scss'

/**
 * View modes for the BiDaily system
 * - normal: Show all tasks
 * - focus: Focus mode - highlight A priority, dim others
 * - batch: Batch mode - show only D priority tasks for quick processing
 */
export type ViewMode = 'normal' | 'focus' | 'batch'

interface ViewModeSwitcherProps {
  currentMode: ViewMode
  onModeChange: (mode: ViewMode) => void
  compact?: boolean
}

const VIEW_MODES = [
  {
    id: 'normal' as ViewMode,
    label: '全览',
    labelEn: 'Overview',
    icon: <VisibilityIcon fontSize="small" />,
    tooltip: '显示所有任务'
  },
  {
    id: 'focus' as ViewMode,
    label: '深度专注',
    labelEn: 'Deep Focus',
    icon: <CenterFocusStrongIcon fontSize="small" />,
    tooltip: '专注于核心任务 (A级)，其他任务淡化'
  },
  {
    id: 'batch' as ViewMode,
    label: '琐事批处理',
    labelEn: 'Batch',
    icon: <PlaylistAddCheckIcon fontSize="small" />,
    tooltip: '只显示琐事 (D级)，适合快速批量处理'
  }
]

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = memo(({
  currentMode,
  onModeChange,
  compact = false
}) => {
  return (
    <Box className={`view-mode-switcher ${compact ? 'compact' : ''}`}>
      <ButtonGroup variant="outlined" size="small">
        {VIEW_MODES.map((mode) => (
          <Tooltip key={mode.id} title={mode.tooltip} arrow placement="bottom">
            <Button
              className={currentMode === mode.id ? 'active' : ''}
              onClick={() => onModeChange(mode.id)}
              startIcon={!compact ? mode.icon : undefined}
            >
              {compact ? mode.icon : mode.label}
            </Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Box>
  )
})

ViewModeSwitcher.displayName = 'ViewModeSwitcher'

export default ViewModeSwitcher
