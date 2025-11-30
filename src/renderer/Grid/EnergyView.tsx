import React, { memo, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import './EnergyView.scss'

const { ipcRenderer } = window.api

/**
 * Priority colors matching the 1-2-3-5 quota system
 */
const PRIORITY_COLORS = {
  A: '#e63946', // Red - Core Challenge
  B: '#f4a261', // Orange - Key Progress
  C: '#2a9d8f', // Teal - Standard Tasks
  D: '#8d99ae'  // Gray - Admin/Batch
}

const PRIORITY_LABELS = {
  A: { en: 'Core', cn: '核心' },
  B: { en: 'Key', cn: '重要' },
  C: { en: 'Standard', cn: '标准' },
  D: { en: 'Batch', cn: '琐事' }
}

interface QuotaItem {
  priority: 'A' | 'B' | 'C' | 'D'
  current: number
  limit: number
  color: string
  isAtLimit: boolean
}

interface EnergyViewProps {
  unitType: string
  compact?: boolean
}

const EnergyView: React.FC<EnergyViewProps> = memo(({ unitType, compact = false }) => {
  const [quotaItems, setQuotaItems] = useState<QuotaItem[]>([
    { priority: 'A', current: 0, limit: 1, color: PRIORITY_COLORS.A, isAtLimit: false },
    { priority: 'B', current: 0, limit: 2, color: PRIORITY_COLORS.B, isAtLimit: false },
    { priority: 'C', current: 0, limit: 3, color: PRIORITY_COLORS.C, isAtLimit: false },
    { priority: 'D', current: 0, limit: 5, color: PRIORITY_COLORS.D, isAtLimit: false }
  ])
  const [total, setTotal] = useState({ current: 0, limit: 11 })

  useEffect(() => {
    const handleQuotaDashboard = (_event: any, data: {
      items: Array<{
        priority: 'A' | 'B' | 'C' | 'D'
        current: number
        limit: number
        color: string
        isAtLimit: boolean
      }>
      total: { current: number; limit: number }
    }) => {
      if (data?.items) {
        setQuotaItems(data.items.map(item => ({
          ...item,
          color: PRIORITY_COLORS[item.priority] || item.color
        })))
      }
      if (data?.total) {
        setTotal(data.total)
      }
    }

    ipcRenderer.on('quotaDashboard', handleQuotaDashboard)

    // Request quota data
    if (unitType && unitType !== 'REST') {
      ipcRenderer.send('getQuotaDashboard', unitType)
    }

    return () => {
      ipcRenderer.removeListener('quotaDashboard', handleQuotaDashboard)
    }
  }, [unitType])

  // Calculate segment widths based on limits (total = 11)
  const totalLimit = 11
  const getSegmentWidth = (limit: number) => `${(limit / totalLimit) * 100}%`

  // Get fill percentage for each segment
  const getFillPercentage = (current: number, limit: number) =>
    Math.min(100, (current / limit) * 100)

  return (
    <Box className={`energy-view ${compact ? 'compact' : ''}`}>
      <Box className="energy-bar">
        {quotaItems.map((item) => (
          <Tooltip
            key={item.priority}
            title={`(${item.priority}) ${PRIORITY_LABELS[item.priority].cn}: ${item.current}/${item.limit}`}
            arrow
            placement="top"
          >
            <Box
              className={`energy-segment ${item.isAtLimit ? 'at-limit' : ''}`}
              style={{
                width: getSegmentWidth(item.limit),
                backgroundColor: `${item.color}33` // 20% opacity background
              }}
            >
              <Box
                className="energy-fill"
                style={{
                  width: `${getFillPercentage(item.current, item.limit)}%`,
                  backgroundColor: item.color
                }}
              />
              {!compact && (
                <span className="energy-label">
                  {item.priority}
                </span>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>
      {!compact && (
        <Box className="energy-summary">
          <span className="energy-total">
            {total.current}/{total.limit}
          </span>
        </Box>
      )}
    </Box>
  )
})

EnergyView.displayName = 'EnergyView'

export default EnergyView
