import React, { useState, useEffect, memo } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './WeeklyReviewModal.scss'

const { ipcRenderer } = window.api

interface WeeklyStats {
  weekRange: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  unitStats: {
    unitType: string
    label: string
    total: number
    completed: number
    rate: number
  }[]
  delayedTasks: {
    task: string
    delayCount: number
    originalDue: string
  }[]
  qualityLevel: 'excellent' | 'good' | 'needs_improvement' | 'warning'
  insights: string[]
}

interface WeeklyReviewModalProps extends WithTranslation {
  open: boolean
  onClose: () => void
  t: typeof i18n.t
}

const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = memo(({ open, onClose, t }) => {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [userNote, setUserNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      ipcRenderer.send('getWeeklyReviewStats')
    }
  }, [open])

  useEffect(() => {
    const handleWeeklyStats = (_event: any, data: WeeklyStats) => {
      setStats(data)
    }

    const handleWeeklyReviewSaved = (_event: any, result: { success: boolean }) => {
      setSaving(false)
      if (result.success) {
        handleClose()
      }
    }

    ipcRenderer.on('weeklyReviewStats', handleWeeklyStats)
    ipcRenderer.on('weeklyReviewSaved', handleWeeklyReviewSaved)

    return () => {
      ipcRenderer.removeListener('weeklyReviewStats', handleWeeklyStats)
      ipcRenderer.removeListener('weeklyReviewSaved', handleWeeklyReviewSaved)
    }
  }, [])

  const handleClose = () => {
    setStats(null)
    setUserNote('')
    setSaving(false)
    onClose()
  }

  const handleSave = () => {
    setSaving(true)
    ipcRenderer.send('saveWeeklyReview', userNote)
  }

  const handleSkip = () => {
    ipcRenderer.send('skipWeeklyReview')
    handleClose()
  }

  const getQualityEmoji = (level: string): string => {
    switch (level) {
      case 'excellent': return '🌟'
      case 'good': return '✅'
      case 'needs_improvement': return '💪'
      case 'warning': return '⚠️'
      default: return '📊'
    }
  }

  const getQualityLabel = (level: string): string => {
    switch (level) {
      case 'excellent': return '优秀'
      case 'good': return '良好'
      case 'needs_improvement': return '需改进'
      case 'warning': return '需关注'
      default: return '未知'
    }
  }

  const getQualityColor = (level: string): 'success' | 'primary' | 'warning' | 'error' => {
    switch (level) {
      case 'excellent': return 'success'
      case 'good': return 'primary'
      case 'needs_improvement': return 'warning'
      case 'warning': return 'error'
      default: return 'primary'
    }
  }

  // Robustness insight: 100% completion isn't ideal
  const getRobustnessMessage = (rate: number): string | null => {
    if (rate >= 100) {
      return '💡 完成率达到100%可能意味着挑战不足。适当的未完成是健康的，建议下周增加一些有挑战性的任务。'
    }
    if (rate >= 80 && rate < 100) {
      return '✨ 80-90%的完成率是理想状态，说明你在挑战自己的同时保持了良好的执行力。'
    }
    if (rate < 50) {
      return '🔄 完成率较低不必气馁，可以考虑减少任务数量或分解任务。重要的是持续迭代改进。'
    }
    return null
  }

  if (!stats) {
    return (
      <Dialog open={open} onClose={handleClose} className="weekly-review-modal">
        <DialogContent>
          <div className="loading">加载中...</div>
        </DialogContent>
      </Dialog>
    )
  }

  const robustnessMessage = getRobustnessMessage(stats.completionRate)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="weekly-review-modal"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="review-title">
        <Box className="title-content">
          <span className="emoji">{getQualityEmoji(stats.qualityLevel)}</span>
          <span className="title-text">周复盘</span>
          <Chip
            label={getQualityLabel(stats.qualityLevel)}
            color={getQualityColor(stats.qualityLevel)}
            size="small"
            className="quality-chip"
          />
        </Box>
        <Typography variant="caption" className="week-range">
          {stats.weekRange}
        </Typography>
      </DialogTitle>

      <DialogContent className="review-content">
        {/* Overall Summary */}
        <Box className="summary-section">
          <Typography variant="h6" className="section-title">
            本周总览
          </Typography>
          <Box className="summary-stats">
            <Box className="stat-item">
              <Typography variant="h3" className="stat-number">
                {stats.completedTasks}
              </Typography>
              <Typography variant="caption">完成任务</Typography>
            </Box>
            <Box className="stat-item">
              <Typography variant="h3" className="stat-number">
                {stats.totalTasks}
              </Typography>
              <Typography variant="caption">总任务数</Typography>
            </Box>
            <Box className="stat-item">
              <Typography variant="h3" className={`stat-number rate-${stats.qualityLevel}`}>
                {stats.completionRate}%
              </Typography>
              <Typography variant="caption">完成率</Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={stats.completionRate}
            className={`progress-bar ${stats.qualityLevel}`}
          />
        </Box>

        {/* Robustness Insight */}
        {robustnessMessage && (
          <Box className="robustness-insight">
            <Typography variant="body2">
              {robustnessMessage}
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Unit Breakdown */}
        <Box className="unit-breakdown">
          <Typography variant="h6" className="section-title">
            各周期表现
          </Typography>
          <Box className="unit-grid">
            {stats.unitStats.map((unit) => (
              <Box key={unit.unitType} className={`unit-card unit-${unit.unitType.toLowerCase()}`}>
                <Typography variant="subtitle2" className="unit-label">
                  {unit.label}
                </Typography>
                <Box className="unit-progress">
                  <Typography variant="h5" className="unit-rate">
                    {unit.rate}%
                  </Typography>
                  <Typography variant="caption" className="unit-count">
                    {unit.completed}/{unit.total}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={unit.rate}
                  className={`unit-progress-bar ${unit.rate >= 80 ? 'good' : unit.rate >= 50 ? 'ok' : 'low'}`}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Delayed Tasks Focus */}
        {stats.delayedTasks.length > 0 && (
          <>
            <Divider />
            <Box className="delayed-tasks">
              <Typography variant="h6" className="section-title">
                ⚠️ 反复延期任务 (重点关注)
              </Typography>
              <Typography variant="body2" color="text.secondary" className="delayed-hint">
                这些任务被多次推迟，可能需要重新评估或分解
              </Typography>
              <Box className="delayed-list">
                {stats.delayedTasks.map((task, index) => (
                  <Box key={index} className="delayed-item">
                    <Typography variant="body2" className="task-text">
                      {task.task}
                    </Typography>
                    <Chip
                      label={`延期 ${task.delayCount} 次`}
                      size="small"
                      color="warning"
                      className="delay-chip"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Insights */}
        {stats.insights.length > 0 && (
          <>
            <Divider />
            <Box className="insights">
              <Typography variant="h6" className="section-title">
                💡 本周洞察
              </Typography>
              <ul className="insight-list">
                {stats.insights.map((insight, index) => (
                  <li key={index}>
                    <Typography variant="body2">{insight}</Typography>
                  </li>
                ))}
              </ul>
            </Box>
          </>
        )}

        <Divider />

        {/* User Reflection */}
        <Box className="user-reflection">
          <Typography variant="h6" className="section-title">
            📝 周复盘笔记
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="记录本周的收获、挑战、下周改进计划..."
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            variant="outlined"
            size="small"
          />
        </Box>
      </DialogContent>

      <DialogActions className="review-actions">
        <button onClick={handleSkip} className="skip-button">
          跳过复盘
        </button>
        <button onClick={handleSave} disabled={saving} className="save-button">
          {saving ? '保存中...' : '保存周复盘'}
        </button>
      </DialogActions>
    </Dialog>
  )
})

WeeklyReviewModal.displayName = 'WeeklyReviewModal'

export default withTranslation()(WeeklyReviewModal)
