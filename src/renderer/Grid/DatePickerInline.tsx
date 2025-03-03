import React, { useState } from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Chip from '@mui/material/Chip'
import Badge from '@mui/material/Badge'
import { HandleFilterSelect, friendlyDate, IsSelected } from '../Shared'
import { withTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
dayjs.extend(updateLocale)

const { ipcRenderer } = window.api

interface DatePickerInlineComponentProps {
  type: string
  todoObject: TodoObject
  date: string | null
  filters: Filters | null
  settings: Settings
  t: typeof i18n.t
}

const DatePickerInlineComponent: React.FC<DatePickerInlineComponentProps> = ({
  type,
  todoObject,
  date,
  filters,
  settings,
  t
}) => {
  const [open, setOpen] = useState(false)
  const chipText = type === 'due' ? 'due:' : type === 't' ? 't:' : null

  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart
  })

  const handleChange = (date: dayjs.Dayjs | null): void => {
    try {
      ipcRenderer.send(
        'writeTodoToFile',
        todoObject.lineNumber,
        todoObject.string,
        false,
        type,
        dayjs(date).format('YYYY-MM-DD')
      )
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const handleClick = (event: React.MouseEvent): void => {
    event.preventDefault()
    setOpen?.((prev) => !prev)
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    event.preventDefault()
    if (event.key === 'Enter') {
      setOpen?.((prev) => !prev)
    }
  }

  const DatePickerInline = ({ ...props }): void => {
    const ButtonField = ({ ...props }): void => {
      const { disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {}} = props
      const mustNotify = type === 'due' ? !todoObject?.notify : true
      const groupedName =
        settings.useHumanFriendlyDates && dayjs(date).isValid()
          ? friendlyDate(date, type, settings, t).pop()
          : date

      return (
        <span className={IsSelected(type, filters, [date]) ? 'selected' : null} data-todotxt-attribute={type}>
          <button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel} tabIndex={-1}>
            <Badge variant="dot" invisible={mustNotify}>
              <Chip
                onClick={() => HandleFilterSelect(type, [date], filters, false)}
                label={chipText}
                data-testid={`datagrid-button-${type}`}
                tabIndex={0}
              />
              <div
                onClick={(event) => handleClick(event)}
                onKeyDown={(event) => handleKeyDown(event)}
                data-testid={`datagrid-picker-date-${type}`}
                tabIndex={0}
              >
                {groupedName}
              </div>
            </Badge>
          </button>
        </span>
      )
    }
    return (
      <DatePicker
        slots={{
          field: ButtonField,
          ...props.slots
        }}
        slotProps={{ field: { setOpen, date } }}
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        value={dayjs(date)}
      />
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language}>
      <DatePickerInline onChange={handleChange} date={date} />
    </LocalizationProvider>
  )
}

export default withTranslation()(DatePickerInlineComponent)
