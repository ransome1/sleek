import React, { memo, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import ArchiveIcon from '@mui/icons-material/Archive'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import EventIcon from '@mui/icons-material/Event'
import { AlertColor } from '@mui/material/Alert'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './BatchOperationsBar.scss'

const { ipcRenderer } = window.api

interface BatchOperationsBarProps extends WithTranslation {
  selectedTodos: number[]
  setSelectedTodos: React.Dispatch<React.SetStateAction<number[]>>
  setBatchMode: React.Dispatch<React.SetStateAction<boolean>>
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<AlertColor | undefined>>
  t: typeof i18n.t
}

const BatchOperationsBar: React.FC<BatchOperationsBarProps> = memo(({
  selectedTodos,
  setSelectedTodos,
  setBatchMode,
  setSnackBarContent,
  setSnackBarSeverity,
  t
}) => {
  const [priorityAnchor, setPriorityAnchor] = useState<null | HTMLElement>(null)

  const handleClearSelection = () => {
    setSelectedTodos([])
  }

  const handleExitBatchMode = () => {
    setSelectedTodos([])
    setBatchMode(false)
  }

  // Batch complete all selected todos
  const handleBatchComplete = () => {
    selectedTodos.forEach((lineNumber) => {
      ipcRenderer.send('batchUpdateTodo', lineNumber, 'complete', true)
    })
    setSnackBarContent(t('batch.completed', { count: selectedTodos.length }))
    setSnackBarSeverity('success')
    setSelectedTodos([])
  }

  // Batch delete all selected todos
  const handleBatchDelete = () => {
    // Delete from end to start to avoid index shifting issues
    const sortedIndexes = [...selectedTodos].sort((a, b) => b - a)
    sortedIndexes.forEach((lineNumber) => {
      ipcRenderer.send('removeLineFromFile', lineNumber)
    })
    setSnackBarContent(t('batch.deleted', { count: selectedTodos.length }))
    setSnackBarSeverity('success')
    setSelectedTodos([])
  }

  // Batch archive all selected todos
  const handleBatchArchive = () => {
    selectedTodos.forEach((lineNumber) => {
      ipcRenderer.send('batchUpdateTodo', lineNumber, 'archive', true)
    })
    setSnackBarContent(t('batch.archived', { count: selectedTodos.length }))
    setSnackBarSeverity('success')
    setSelectedTodos([])
  }

  // Batch change priority
  const handleBatchPriority = (priority: string | null) => {
    selectedTodos.forEach((lineNumber) => {
      ipcRenderer.send('batchUpdateTodo', lineNumber, 'priority', priority)
    })
    setSnackBarContent(t('batch.priorityChanged', { count: selectedTodos.length, priority: priority || 'None' }))
    setSnackBarSeverity('success')
    setPriorityAnchor(null)
    setSelectedTodos([])
  }

  const handlePriorityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPriorityAnchor(event.currentTarget)
  }

  const handlePriorityMenuClose = () => {
    setPriorityAnchor(null)
  }

  return (
    <Paper className="batch-operations-bar" elevation={3}>
      <Box className="batch-info">
        <Typography variant="body2" className="selection-count">
          {t('batch.selected', { count: selectedTodos.length })}
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={handleClearSelection}
          className="clear-btn"
        >
          {t('batch.clearSelection')}
        </Button>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box className="batch-actions">
        <Tooltip title={t('batch.completeAll')} arrow>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleBatchComplete}
            className="action-btn"
          >
            {t('batch.complete')}
          </Button>
        </Tooltip>

        <Tooltip title={t('batch.changePriority')} arrow>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PriorityHighIcon />}
            onClick={handlePriorityMenuOpen}
            className="action-btn"
          >
            {t('batch.priority')}
          </Button>
        </Tooltip>
        <Menu
          anchorEl={priorityAnchor}
          open={Boolean(priorityAnchor)}
          onClose={handlePriorityMenuClose}
        >
          <MenuItem onClick={() => handleBatchPriority('A')}>
            <span className="priority-option priority-a">(A)</span> {t('priority.coreChallenge')}
          </MenuItem>
          <MenuItem onClick={() => handleBatchPriority('B')}>
            <span className="priority-option priority-b">(B)</span> {t('priority.keyProgress')}
          </MenuItem>
          <MenuItem onClick={() => handleBatchPriority('C')}>
            <span className="priority-option priority-c">(C)</span> {t('priority.standard')}
          </MenuItem>
          <MenuItem onClick={() => handleBatchPriority('D')}>
            <span className="priority-option priority-d">(D)</span> {t('priority.admin')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleBatchPriority(null)}>
            {t('priority.none')}
          </MenuItem>
        </Menu>

        <Tooltip title={t('batch.archiveAll')} arrow>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={handleBatchArchive}
            className="action-btn"
          >
            {t('batch.archive')}
          </Button>
        </Tooltip>

        <Tooltip title={t('batch.deleteAll')} arrow>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBatchDelete}
            className="action-btn delete-btn"
          >
            {t('batch.delete')}
          </Button>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Tooltip title={t('batch.exitMode')} arrow>
        <IconButton
          size="small"
          onClick={handleExitBatchMode}
          className="exit-btn"
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  )
})

BatchOperationsBar.displayName = 'BatchOperationsBar'

export default withTranslation()(BatchOperationsBar)
