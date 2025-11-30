import React, { useState, useRef, memo } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import dayjs from 'dayjs'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './QuickAddBar.scss'

const { ipcRenderer } = window.api

interface QuickAddBarProps extends WithTranslation {
  settings: Settings
  t: typeof i18n.t
}

// Natural language date patterns
const datePatterns: { pattern: RegExp; transform: () => string }[] = [
  { pattern: /\btoday\b/i, transform: () => dayjs().format('YYYY-MM-DD') },
  { pattern: /\btomorrow\b/i, transform: () => dayjs().add(1, 'day').format('YYYY-MM-DD') },
  { pattern: /\byesterday\b/i, transform: () => dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
  { pattern: /\bnext week\b/i, transform: () => dayjs().add(1, 'week').format('YYYY-MM-DD') },
  { pattern: /\bnext month\b/i, transform: () => dayjs().add(1, 'month').format('YYYY-MM-DD') },
  { pattern: /\bmonday\b/i, transform: () => dayjs().day(1).format('YYYY-MM-DD') },
  { pattern: /\btuesday\b/i, transform: () => dayjs().day(2).format('YYYY-MM-DD') },
  { pattern: /\bwednesday\b/i, transform: () => dayjs().day(3).format('YYYY-MM-DD') },
  { pattern: /\bthursday\b/i, transform: () => dayjs().day(4).format('YYYY-MM-DD') },
  { pattern: /\bfriday\b/i, transform: () => dayjs().day(5).format('YYYY-MM-DD') },
  { pattern: /\bsaturday\b/i, transform: () => dayjs().day(6).format('YYYY-MM-DD') },
  { pattern: /\bsunday\b/i, transform: () => dayjs().day(0).format('YYYY-MM-DD') },
  // Chinese patterns
  { pattern: /\b今天\b/, transform: () => dayjs().format('YYYY-MM-DD') },
  { pattern: /\b明天\b/, transform: () => dayjs().add(1, 'day').format('YYYY-MM-DD') },
  { pattern: /\b后天\b/, transform: () => dayjs().add(2, 'day').format('YYYY-MM-DD') },
  { pattern: /\b昨天\b/, transform: () => dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
  { pattern: /\b下周\b/, transform: () => dayjs().add(1, 'week').format('YYYY-MM-DD') },
  { pattern: /\b下个月\b/, transform: () => dayjs().add(1, 'month').format('YYYY-MM-DD') },
]

// Priority patterns
const priorityPatterns: { pattern: RegExp; priority: string }[] = [
  { pattern: /\b!1\b|\bhigh\b|\burgent\b|\b紧急\b|\b重要\b/i, priority: 'A' },
  { pattern: /\b!2\b|\bmedium\b|\b中等\b/i, priority: 'B' },
  { pattern: /\b!3\b|\blow\b|\b普通\b/i, priority: 'C' },
  { pattern: /\b!4\b|\badmin\b|\b琐事\b/i, priority: 'D' },
]

// Parse natural language input to todo.txt format
const parseNaturalLanguage = (input: string): string => {
  let result = input
  let dueDate: string | null = null
  let priority: string | null = null

  // Extract date from natural language
  for (const { pattern, transform } of datePatterns) {
    if (pattern.test(result)) {
      dueDate = transform()
      result = result.replace(pattern, '').trim()
      break
    }
  }

  // Extract priority
  for (const { pattern, priority: p } of priorityPatterns) {
    if (pattern.test(result)) {
      priority = p
      result = result.replace(pattern, '').trim()
      break
    }
  }

  // Build todo.txt string
  let todoString = ''
  if (priority) {
    todoString = `(${priority}) `
  }
  todoString += result.trim()
  if (dueDate) {
    todoString += ` due:${dueDate}`
  }

  return todoString
}

const QuickAddBar: React.FC<QuickAddBarProps> = memo(({ settings, t }) => {
  const [inputValue, setInputValue] = useState('')
  const [preview, setPreview] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Show preview of parsed result
    if (value.trim()) {
      const parsed = parseNaturalLanguage(value)
      setPreview(parsed !== value ? parsed : '')
    } else {
      setPreview('')
    }
  }

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    const todoString = parseNaturalLanguage(inputValue)
    ipcRenderer.send('writeTodoToFile', -1, todoString)

    setInputValue('')
    setPreview('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const helpText = t('quickAdd.help')

  return (
    <Box className="quick-add-bar">
      <TextField
        inputRef={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t('quickAdd.placeholder')}
        variant="outlined"
        size="small"
        fullWidth
        className="quick-add-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AddIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip
                title={
                  <Box sx={{ fontSize: '12px', lineHeight: 1.5 }}>
                    <strong>{t('quickAdd.helpTitle')}</strong>
                    <br />
                    {t('quickAdd.helpDate')}: today, tomorrow, monday...
                    <br />
                    {t('quickAdd.helpPriority')}: !1 (A), !2 (B), !3 (C), !4 (D)
                    <br />
                    {t('quickAdd.helpProject')}: +ProjectName
                    <br />
                    {t('quickAdd.helpContext')}: @ContextName
                  </Box>
                }
                arrow
                placement="bottom-end"
              >
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={handleSubmit} disabled={!inputValue.trim()}>
                <AddIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {preview && (
        <Box className="quick-add-preview">
          <span className="preview-label">{t('quickAdd.preview')}:</span>
          <code>{preview}</code>
        </Box>
      )}
    </Box>
  )
})

QuickAddBar.displayName = 'QuickAddBar'

export default withTranslation()(QuickAddBar)
