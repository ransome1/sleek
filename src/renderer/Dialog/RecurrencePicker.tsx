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

interface RecurrencePickerProps extends WithTranslation {
  recurrence: string | null
  handleChange: (key: string, value: string) => void
  t: typeof i18n.t
}

const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ recurrence, handleChange, t }) => {
  const recurrenceFieldRef = useRef<HTMLInputElement | null>(null)
  const [strictRecurrence, setStrictRecurrence] = useState<boolean>(false)
  const [interval, setInterval] = useState<string | null>(null)
  const [amount, setAmount] = useState<string | null>(null)

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!amount) setAmount('1')
    setInterval(event.target.value)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!interval) setInterval('d')
    setAmount(event.target.value)
  }

  const handleStrictRecurrenceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!recurrence) return
    setStrictRecurrence(event.target.checked)
  }

  useEffect(() => {
    if (amount && interval) {
      const updatedValue = strictRecurrence ? '+' + amount + interval : amount + interval
      handleChange('rec', updatedValue)
    }
  }, [interval, amount, strictRecurrence, handleChange])

  useEffect(() => {
    const getInterval = (recurrence: string | null): void =>
      recurrence ? recurrence.match(/[a-zA-Z]+/) : null
    const getAmount = (recurrence: string | null): void =>
      recurrence ? recurrence.match(/\d+/) : null
    const getStrictIndicator = (recurrence: string | null): void => !!recurrence?.startsWith('+')

    setStrictRecurrence(getStrictIndicator(recurrence))
    setInterval(getInterval(recurrence))
    setAmount(getAmount(recurrence))
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
            onChange={() => handleChange('rec', recurrence ?? '')}
            value={recurrence || '-'}
            inputRef={recurrenceFieldRef}
            data-testid="dialog-picker-recurrence"
            InputLabelProps={{
              shrink: true
            }}
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
                onChange={handleAmountChange}
                defaultValue={amount || '1'}
                className="recurrencePickerPopupInput"
                inputProps={{
                  min: 0
                }}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </FormControl>
            <FormControl>
              <RadioGroup
                aria-labelledby="recurrencePickerRadioGroup"
                value={interval || null}
                onChange={handleIntervalChange}
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
                    onChange={handleStrictRecurrenceChange}
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
  )
}

export default withTranslation()(RecurrencePicker)
