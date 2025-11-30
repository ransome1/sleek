import React, { useEffect, useState, memo } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import './QuotaDashboard.scss'

const { ipcRenderer } = window.api

interface QuotaItem {
  priority: string | null
  emoji: string
  label: string
  labelCN: string
  current: number
  limit: number
  color: string
  isAtLimit: boolean
}

interface QuotaDashboardData {
  items: QuotaItem[]
  total: { current: number; limit: number }
}

interface QuotaDashboardProps {
  unitType?: string
  compact?: boolean
  showTotal?: boolean
}

const QuotaDashboard: React.FC<QuotaDashboardProps> = memo(({
  unitType,
  compact = false,
  showTotal = true
}) => {
  const [dashboard, setDashboard] = useState<QuotaDashboardData | null>(null)

  useEffect(() => {
    const handleDashboard = (_event: any, data: QuotaDashboardData) => {
      setDashboard(data)
    }

    ipcRenderer.on('quotaDashboard', handleDashboard)
    ipcRenderer.send('getQuotaDashboard', unitType)

    return () => {
      ipcRenderer.removeListener('quotaDashboard', handleDashboard)
    }
  }, [unitType])

  // Refresh when data changes
  useEffect(() => {
    const handleDataChange = () => {
      ipcRenderer.send('getQuotaDashboard', unitType)
    }

    ipcRenderer.on('requestData', handleDataChange)
    return () => {
      ipcRenderer.removeListener('requestData', handleDataChange)
    }
  }, [unitType])

  if (!dashboard) return null

  const totalProgress = (dashboard.total.current / dashboard.total.limit) * 100

  if (compact) {
    return (
      <Box className="quota-dashboard compact">
        {dashboard.items.map((item) => (
          <Tooltip
            key={item.priority}
            title={`${item.labelCN}: ${item.current}/${item.limit}`}
            arrow
          >
            <span
              className={`quota-badge ${item.isAtLimit ? 'at-limit' : ''}`}
              style={{ borderColor: item.color }}
            >
              {item.emoji} {item.current}/{item.limit}
            </span>
          </Tooltip>
        ))}
      </Box>
    )
  }

  return (
    <Box className="quota-dashboard">
      <Box className="quota-items">
        {dashboard.items.map((item) => {
          const progress = (item.current / item.limit) * 100

          return (
            <Tooltip
              key={item.priority}
              title={`${item.label} - ${item.labelCN}`}
              arrow
              placement="top"
            >
              <Box
                className={`quota-item ${item.isAtLimit ? 'at-limit' : ''}`}
              >
                <Box className="quota-header">
                  <span className="quota-emoji">{item.emoji}</span>
                  <span className="quota-priority">[{item.priority}]</span>
                  <span className="quota-count">
                    {item.current}/{item.limit}
                  </span>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progress, 100)}
                  className="quota-progress"
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: item.isAtLimit ? '#e53935' : item.color
                    }
                  }}
                />
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      {showTotal && (
        <Box className="quota-total">
          <Typography variant="caption" className="total-label">
            总计: {dashboard.total.current}/{dashboard.total.limit}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(totalProgress, 100)}
            className="total-progress"
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: totalProgress >= 100 ? '#e53935' : '#4caf50'
              }
            }}
          />
        </Box>
      )}
    </Box>
  )
})

QuotaDashboard.displayName = 'QuotaDashboard'

export default QuotaDashboard
