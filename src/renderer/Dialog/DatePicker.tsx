import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import './DatePicker.scss'

dayjs.extend(updateLocale)

interface DatePickerComponentProps extends WithTranslation {
  date: string | null
  type: string
  settings: Settings
  handleChange: (type: string, value: dayjs.Dayjs | null) => void
  t: typeof i18n.t
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  date,
  type,
  settings,
  handleChange,
  t
}) => {
  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart
  })
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={t(`todoDialog.datePicker.${type}`)}
        value={date ? dayjs(date) : null}
        onChange={(date) => handleChange(type, date)}
        slotProps={{
          field: { clearable: true, onClear: () => handleChange(type, null) }
        }}
      />
    </LocalizationProvider>
  )
}

export default withTranslation()(DatePickerComponent)