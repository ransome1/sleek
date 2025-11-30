import React, { useState, useEffect, memo } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './ReviewModal.scss'

const { ipcRenderer } = window.api

interface PriorityStat {
  priority: string
  total: number
  completed: number
  label: string
}

interface UnitReviewStats {
  unitType: string
  unitLabel: string
  dateRange: string
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  completionRate: number
  priorityStats: PriorityStat[]
  totalPomodoros: number
  completedPomodoros: number
  estimatedMinutes: number
  coreChallenge: {
    exists: boolean
    completed: boolean
    task: string | null
  }
}

interface ReviewModalProps extends WithTranslation {
  open: boolean
  onClose: () => void
  unitType: string | null
  t: typeof i18n.t
}

const ReviewModal: React.FC<ReviewModalProps> = memo(({ open, onClose, unitType, t }) => {
  const [stats, setStats] = useState<UnitReviewStats | null>(null)
  const [userNote, setUserNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && unitType) {
      ipcRenderer.send('getReviewStats', unitType)
    }
  }, [open, unitType])

  useEffect(() => {
    const handleReviewStats = (_event: any, data: UnitReviewStats) => {
      setStats(data)
    }

    const handleReviewNoteSaved = (_event: any, result: { success: boolean; error?: string }) => {
      setSaving(false)
      if (result.success) {
        handleClose()
      }
    }

    ipcRenderer.on('reviewStats', handleReviewStats)
    ipcRenderer.on('reviewNoteSaved', handleReviewNoteSaved)

    return () => {
      ipcRenderer.removeListener('reviewStats', handleReviewStats)
      ipcRenderer.removeListener('reviewNoteSaved', handleReviewNoteSaved)
    }
  }, [])

  const handleClose = () => {
    setStats(null)
    setUserNote('')
    setSaving(false)
    onClose()
  }

  const handleSkip = () => {
    ipcRenderer.send('markReviewCompleted')
    handleClose()
  }

  const handleSave = () => {
    if (unitType) {
      setSaving(true)
      ipcRenderer.send('saveReviewNote', unitType, userNote)
    }
  }

  const getCompletionEmoji = (rate: number): string => {
    if (rate >= 80) return '🎉'
    if (rate >= 50) return '💪'
    return '🤔'
  }

  const getCompletionMessage = (rate: number, unitLabel: string): string => {
    if (rate >= 80) return `你在 ${unitLabel} 完成了 ${rate}% 的任务，表现优秀！`
    if (rate >= 50) return `${unitLabel} 完成率 ${rate}%，继续加油！`
    return `${unitLabel} 完成率 ${rate}%，下个周期可以考虑减少任务量。`
  }

  if (!stats) {
    return (
      <Dialog open={open} onClose={handleClose} className="review-modal">
        <DialogContent>
          <div className="loading">加载中...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} className="review-modal" maxWidth="sm" fullWidth>
      <DialogTitle className="review-title">
        <span className="emoji">{getCompletionEmoji(stats.completionRate)}</span>
        <span>{stats.unitLabel} 复盘</span>
        <span className="date-range">{stats.dateRange}</span>
      </DialogTitle>

      <DialogContent className="review-content">
        {/* Completion Overview */}
        <div className="completion-overview">
          <div className="completion-message">
            {getCompletionMessage(stats.completionRate, stats.unitLabel)}
          </div>
          <div className="completion-progress">
            <LinearProgress
              variant="determinate"
              value={stats.completionRate}
              className={`progress-bar ${
                stats.completionRate >= 80 ? 'excellent' :
                stats.completionRate >= 50 ? 'good' : 'needs-work'
              }`}
            />
            <div className="progress-label">
              {stats.completedTasks} / {stats.totalTasks} 任务完成
            </div>
          </div>
        </div>

        <Divider />

        {/* Core Challenge Status */}
        {stats.coreChallenge.exists && (
          <div className="core-challenge">
            <div className="section-title">核心挑战 (A)</div>
            <div className={`challenge-status ${stats.coreChallenge.completed ? 'completed' : 'incomplete'}`}>
              {stats.coreChallenge.completed ? '✅ 已完成' : '⏳ 未完成'}
              {stats.coreChallenge.task && (
                <div className="challenge-task">{stats.coreChallenge.task}</div>
              )}
            </div>
          </div>
        )}

        {/* Priority Breakdown */}
        <div className="priority-breakdown">
          <div className="section-title">优先级分布</div>
          <div className="priority-grid">
            {stats.priorityStats.map((ps) => (
              <div key={ps.priority} className={`priority-item priority-${ps.priority.toLowerCase()}`}>
                <div className="priority-label">({ps.priority}) {ps.label}</div>
                <div className="priority-count">
                  {ps.completed}/{ps.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Tracking */}
        {stats.totalPomodoros > 0 && (
          <>
            <Divider />
            <div className="time-tracking">
              <div className="section-title">时间投入</div>
              <div className="time-stats">
                <div className="time-item">
                  <span className="time-icon">🍅</span>
                  <span>{stats.completedPomodoros}/{stats.totalPomodoros} 番茄钟</span>
                </div>
                <div className="time-item">
                  <span className="time-icon">⏱️</span>
                  <span>约 {stats.estimatedMinutes} 分钟</span>
                </div>
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* User Note Input */}
        <div className="user-note">
          <div className="section-title">复盘笔记 (可选)</div>
          <TextField
            multiline
            rows={3}
            fullWidth
            placeholder="记录这个周期的心得、反思或改进点..."
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            variant="outlined"
            size="small"
          />
        </div>
      </DialogContent>

      <DialogActions className="review-actions">
        <button onClick={handleSkip} className="skip-button">
          跳过复盘
        </button>
        <button onClick={handleSave} disabled={saving} className="save-button">
          {saving ? '保存中...' : '保存复盘'}
        </button>
      </DialogActions>
    </Dialog>
  )
})

ReviewModal.displayName = 'ReviewModal'

export default withTranslation()(ReviewModal)
