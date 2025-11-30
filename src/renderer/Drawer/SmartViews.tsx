import React, { memo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import TodayIcon from '@mui/icons-material/Today'
import DateRangeIcon from '@mui/icons-material/DateRange'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import dayjs from 'dayjs'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import { HandleFilterSelect } from '../Shared'
import './SmartViews.scss'

const { ipcRenderer } = window.api

interface SmartViewsProps extends WithTranslation {
  filters: Filters | null
  t: typeof i18n.t
}

const SmartViews: React.FC<SmartViewsProps> = memo(({ filters, t }) => {
  const today = dayjs().format('YYYY-MM-DD')

  // Get next 7 days as array of date strings
  const getNext7Days = (): string[] => {
    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      dates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'))
    }
    return dates
  }

  // Check if "Today" filter is active
  const isTodayActive = (): boolean => {
    if (!filters) return false
    const dueFilters = filters.find((f: any) => f.key === 'due')
    if (!dueFilters) return false
    return dueFilters.values?.includes(today) && dueFilters.values?.length === 1
  }

  // Check if "Next 7 Days" filter is active
  const isNext7DaysActive = (): boolean => {
    if (!filters) return false
    const dueFilters = filters.find((f: any) => f.key === 'due')
    if (!dueFilters) return false
    const next7 = getNext7Days()
    return next7.every((d) => dueFilters.values?.includes(d))
  }

  // Check if no date filter is active (All)
  const isAllActive = (): boolean => {
    if (!filters) return true
    const dueFilters = filters.find((f: any) => f.key === 'due')
    return !dueFilters || !dueFilters.values || dueFilters.values.length === 0
  }

  const handleTodayClick = () => {
    HandleFilterSelect('due', [today], filters, false)
  }

  const handleNext7DaysClick = () => {
    const next7 = getNext7Days()
    HandleFilterSelect('due', next7, filters, false)
  }

  const handleAllClick = () => {
    // Clear due date filter
    HandleFilterSelect('due', [], filters, false)
  }

  return (
    <Box className="smart-views">
      <Box className="smart-views-label">{t('smartViews.label')}</Box>
      <ButtonGroup variant="outlined" size="small" fullWidth>
        <Button
          startIcon={<AllInclusiveIcon />}
          onClick={handleAllClick}
          className={isAllActive() ? 'active' : ''}
        >
          {t('smartViews.all')}
        </Button>
        <Button
          startIcon={<TodayIcon />}
          onClick={handleTodayClick}
          className={isTodayActive() ? 'active' : ''}
        >
          {t('smartViews.today')}
        </Button>
        <Button
          startIcon={<DateRangeIcon />}
          onClick={handleNext7DaysClick}
          className={isNext7DaysActive() ? 'active' : ''}
        >
          {t('smartViews.next7Days')}
        </Button>
      </ButtonGroup>
    </Box>
  )
})

SmartViews.displayName = 'SmartViews'

export default withTranslation()(SmartViews)
