import React, { useState, useRef, useEffect } from 'react';
import { FormControl, TextField, FormControlLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './RecurrencePicker.scss';

const { ipcRenderer } = window.api;

const getInterval = (recurrence: string | null) => {
  return recurrence && recurrence.startsWith('+') ? recurrence.slice(2, 3) : recurrence ? recurrence.slice(1, 2) : null;
}

const getAmount = (recurrence: string | null) => {
  return recurrence && recurrence.startsWith('+') ? recurrence.slice(1, 2) : recurrence ? recurrence.slice(0, 1) : null;
}

const getStrictIndicator = (recurrence: string | null) => {
  return recurrence ? recurrence.startsWith('+') : false;
}

interface Props extends WithTranslation {
  recurrence: string | null;
  textFieldValue: string;
  todoObject: TodoObject | null;
  t: typeof i18n.t;
}

const RecurrencePicker: React.FC<Props> = ({
  recurrence,
  textFieldValue,
  todoObject,
  t
}) => {
  const recurrenceFieldRef = useRef<HTMLInputElement | null>(null);
  const [strictRecurrence, setStrictRecurrence] = useState<boolean>(false);
  const [interval, setInterval] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  const handleChange = (recurrence: string | null, event?: React.ChangeEvent<HTMLInputElement> | undefined) => {
    try {
      event?.preventDefault();
      ipcRenderer.send('updateTodoObject', todoObject?.id, textFieldValue, 'rec', recurrence);
    } catch(error: any) {
      console.error(error);
    }
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!amount) setAmount('1');
    setInterval(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!interval) setInterval('d');
    setAmount(event.target.value);
  };

  const handleStrictRecurrenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!recurrence) return;
    setStrictRecurrence(event.target.checked);
  };

  useEffect(() => {
    if(amount && interval) {
      const updatedValue = strictRecurrence ? '+' + amount + interval : amount + interval;
      handleChange(updatedValue);
    }
  }, [interval, amount, strictRecurrence]);

  useEffect(() => {
    setStrictRecurrence(getStrictIndicator(recurrence));
    setInterval(getInterval(recurrence));
    setAmount(getAmount(recurrence));
  }, [recurrence]);

  useEffect(() => {
    const handleEnterKeyPress = (event: KeyboardEvent) => {
      if(event.key === 'Enter') {
        event.preventDefault();
        if(recurrenceFieldRef.current) {
          recurrenceFieldRef.current.click();
        }
      }
    };

    if(recurrenceFieldRef.current) {
      recurrenceFieldRef.current.addEventListener('keydown', handleEnterKeyPress);
    }

    return () => {
      if(recurrenceFieldRef.current) {
        recurrenceFieldRef.current.removeEventListener('keydown', handleEnterKeyPress);
      }
    };
  }, [recurrenceFieldRef]);

  return (
    <PopupState variant="popover" popupId="recurrencePicker" disableAutoFocus={true} parentPopupState={null}>
      {(popupState) => (
        <FormControl>
          <TextField
            label={t('todoDialog.recurrencePicker.label')}
            className="recurrencePicker"
            onChange={() => handleChange(recurrence)}
            value={recurrence || '-'}
            inputRef={recurrenceFieldRef}
            data-testid="dialog--picker-recurrence"
            InputLabelProps={{
              shrink: true,
            }}
            {...bindTrigger(popupState)}
          />

          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
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
                  min: 0,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl>
              <RadioGroup
                aria-labelledby="recurrencePickerRadioGroup"
                value={interval || null}
                onChange={handleIntervalChange}
              >
                <FormControlLabel value="d" control={<Radio />} label={t('todoDialog.recurrencePicker.day')} />
                <FormControlLabel value="b" control={<Radio />} label={t('todoDialog.recurrencePicker.businessDay')} />
                <FormControlLabel value="w" control={<Radio />} label={t('todoDialog.recurrencePicker.week')} />
                <FormControlLabel value="m" control={<Radio />} label={t('todoDialog.recurrencePicker.month')} />
                <FormControlLabel value="y" control={<Radio />} label={t('todoDialog.recurrencePicker.year')} />
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
  );
};

export default withTranslation()(RecurrencePicker);
