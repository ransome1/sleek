import React, { useState, useRef, useEffect } from 'react'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Checkbox from '@mui/material/Checkbox'
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state'
import Popover from '@mui/material/Popover'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './RecurrencePicker.scss'

const getInterval = (recurrence: string | null): string => {
  if (!recurrence) return 'd'
  const m = recurrence.match(/[a-zA-Z]+/)
  if (!m) return 'd'
  return m[0]
}
const getAmount = (recurrence: string | null): string => {
  if (!recurrence) return '1'
  const m = recurrence.match(/\d+/)
  if (!m) return ''
  return m[0]
}
const getStrictIndicator = (recurrence: string | null): boolean => !!recurrence?.startsWith('+')

interface RecurrencePickerComponentProps extends WithTranslation {
  recurrence: string | null
  handleChange: (key: string, value: string) => void
  t: typeof i18n.t
}

const RecurrencePickerComponent: React.FC<RecurrencePickerComponentProps> = ({
  recurrence,
  handleChange,
  t
}) => {

  const recurrenceFieldRef = useRef<HTMLInputElement | null>(null)
  const [strictRecurrence, setStrictRecurrence] = useState<boolean>(false)
  const [interval, setInterval] = useState<string>('d')
  const [amount, setAmount] = useState<string>('1')

  useEffect(() => {
    setStrictRecurrence(getStrictIndicator(recurrence))
    setAmount(getAmount(recurrence))
    setInterval(getInterval(recurrence))
  }, [recurrence])

  useEffect(() => {
    const handleEnterKeyPress = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        event.preventDefault()
        if (recurrenceFieldRef.current) {
          recurrenceFieldRef.current.click()
        }
      }
    }

    if (recurrenceFieldRef.current) {
      recurrenceFieldRef.current.addEventListener('keydown', handleEnterKeyPress)
    }

    return (): void => {
      if (recurrenceFieldRef.current) {
        recurrenceFieldRef.current.removeEventListener('keydown', handleEnterKeyPress)
      }
    }
  }, [recurrenceFieldRef])

  return (
    <PopupState
      variant="popover"
      popupId="recurrencePicker"
      disableAutoFocus={true}
      parentPopupState={null}
    >
      {(popupState) => (
        <FormControl>
          <TextField
            label={t('todoDialog.recurrencePicker.label')}
            className="recurrencePicker"
            onChange={(event) => handleChange('rec', event.target.value ?? '')}
            value={recurrence || '-'}
            inputRef={recurrenceFieldRef}
            data-testid="dialog-picker-recurrence"
            // InputLabelProps={{
            //   shrink: true
            // }}
            {...bindTrigger(popupState)}
          />

          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <FormControl>
              <TextField
                autoFocus={true}
                label={t('todoDialog.recurrencePicker.every')}
                type="number"
                onChange={(event) => {
                  const updatedRecurrence = getStrictIndicator(recurrence) ? '+' + event.target.value + getInterval(recurrence) : event.target.value + getInterval(recurrence)
                  handleChange('rec', updatedRecurrence)
                }}
                value={amount}
                className="recurrencePickerPopupInput"
                slotProps={{
                  htmlInput: {
                    min: 0
                  },

                  inputLabel: {
                    shrink: true
                  }
                }} />
            </FormControl>
            <FormControl>
              <RadioGroup
                aria-labelledby="recurrencePickerRadioGroup"
                value={interval}
                onChange={(event) => {              
                  const updatedRecurrence = getStrictIndicator(recurrence) ? '+' + getAmount(recurrence) + event.target.defaultValue : getAmount(recurrence) + event.target.defaultValue
                  handleChange('rec', updatedRecurrence)                  
                }}
              >
                <FormControlLabel
                  value="d"
                  control={<Radio />}
                  label={t('todoDialog.recurrencePicker.day')}
                />
                <FormControlLabel
                  value="b"
                  control={<Radio />}
                  label={t('todoDialog.recurrencePicker.businessDay')}
                />
                <FormControlLabel
                  value="w"
                  control={<Radio />}
                  label={t('todoDialog.recurrencePicker.week')}
                />
                <FormControlLabel
                  value="m"
                  control={<Radio />}
                  label={t('todoDialog.recurrencePicker.month')}
                />
                <FormControlLabel
                  value="y"
                  control={<Radio />}
                  label={t('todoDialog.recurrencePicker.year')}
                />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={strictRecurrence}
                    onChange={(event) => {
                      const updatedRecurrence = event.target.checked ? '+' + getAmount(recurrence) + getInterval(recurrence) : getAmount(recurrence) + getInterval(recurrence)
                      handleChange('rec', updatedRecurrence)
                    }}
                    name="strictRecurrenceCheckbox"
                  />
                }
                label={t('todoDialog.recurrencePicker.strict')}
              />
            </FormControl>
          </Popover>
        </FormControl>
      )}
    </PopupState>
  );
}

export default withTranslation()(RecurrencePickerComponent)
