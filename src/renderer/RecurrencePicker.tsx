import React, { useState, useRef, useEffect } from 'react';
import { FormControl, TextField, FormControlLabel, Radio, RadioGroup, Checkbox, Badge } from '@mui/material';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import { Item } from 'jstodotxt';
import { withTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import './RecurrencePicker.scss';

interface RecurrencePicker {
  currentRecurrence: string | null;
  setTextFieldValue: (value: string) => void;
  textFieldValue: string;
}

const RecurrencePicker: React.FC<RecurrencePicker> = ({
  currentRecurrence,
  setTextFieldValue,
  textFieldValue,
  t
}) => {
  const recurrenceFieldRef = useRef<HTMLInputElement | null>(null);
  const [recurrence, setRecurrence] = useState<string | null>(currentRecurrence || null);
  const [interval, setInterval] = useState<string | null>(
    currentRecurrence && currentRecurrence.startsWith('+') ? currentRecurrence.slice(2, 3) : currentRecurrence ? currentRecurrence.slice(1, 2) : null
  );
  const [amount, setAmount] = useState<string | null>(
    currentRecurrence && currentRecurrence.startsWith('+') ? currentRecurrence.slice(1, 2) : currentRecurrence ? currentRecurrence.slice(0, 1) : null
  );
  const [strictRecurrence, setStrictRecurrence] = useState<boolean>(currentRecurrence ? currentRecurrence.startsWith('+') : false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = event.target.value;
    setRecurrence(updatedValue);
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!amount) setAmount('1');
    setInterval(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!interval) setInterval('d');
    setAmount(event.target.value);
  };

  const handleStrictRecurrenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!recurrence) return;
    setStrictRecurrence(event.target.checked);
    if (recurrence.startsWith('+')) {
      setRecurrence(recurrence.substr(1));
    } else {
      setRecurrence('+' + recurrence);
    }
  };

  useEffect(() => {
    const updatedValue = strictRecurrence ? '+' + amount + interval : amount + interval;
    setRecurrence(updatedValue);
  }, [amount]);

  useEffect(() => {
    const updatedValue = strictRecurrence ? '+' + amount + interval : amount + interval;
    setRecurrence(updatedValue);
  }, [interval]);

  useEffect(() => {
    if (!recurrence) return;
    const todoObject = new Item(textFieldValue);
    todoObject.setExtension('rec', recurrence);

    setTextFieldValue(todoObject.toString());
    setStrictRecurrence(recurrence.startsWith('+'));

    if (recurrenceFieldRef.current) {
      recurrenceFieldRef.current.value = recurrence;
    }
  }, [recurrence]);

  useEffect(() => {
    const handleEnterKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (recurrenceFieldRef.current) {
          recurrenceFieldRef.current.click();
        }
      }
    };

    if (recurrenceFieldRef.current) {
      recurrenceFieldRef.current.addEventListener('keydown', handleEnterKeyPress);
    }

    return () => {
      if (recurrenceFieldRef.current) {
        recurrenceFieldRef.current.removeEventListener('keydown', handleEnterKeyPress);
      }
    };
  }, [recurrenceFieldRef]);

  return (
    <PopupState variant="popover" popupId="recurrencePicker">
      {(popupState) => (
        <FormControl>
          <TextField
            label={t('todoDialog.recurrencePicker.label')}
            className="recurrencePicker"
            onChange={handleChange}
            defaultValue={currentRecurrence || '-'}
            inputRef={recurrenceFieldRef}
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
                label={t('todoDialog.recurrencePicker.every')}
                type="number"
                onChange={handleAmountChange}
                defaultValue={amount || '1'}
                className="recurrencePickerPopupInput"
                inputProps={{
                  min: 1,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl>
              <RadioGroup
                aria-labelledby="recurrencePickerRadioGroup"
                value={interval || 'd'}
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