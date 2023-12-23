import React, { useState, useRef, useEffect } from 'react';
import { FormControl, TextField, FormControlLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import { Item } from 'jstodotxt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import './RecurrencePicker.scss';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  recurrence: string;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
  t: typeof i18n.t;
}

const getInterval = (recurrence) => {
  return recurrence && recurrence.startsWith('+') ? recurrence.slice(2, 3) : recurrence ? recurrence.slice(1, 2) : null;
}

const getAmount = (recurrence) => {
  return recurrence && recurrence.startsWith('+') ? recurrence.slice(1, 2) : recurrence ? recurrence.slice(0, 1) : null;
}

const getStrictIndicator = (recurrence) => {
  return recurrence ? recurrence.startsWith('+') : false;
}

const RecurrencePicker: React.FC<Props> = ({
  recurrence,
  setTextFieldValue,
  textFieldValue,
  t
}) => {
  const recurrenceFieldRef = useRef<HTMLInputElement | null>(null);
  const [strictRecurrence, setStrictRecurrence] = useState<boolean>(getStrictIndicator(recurrence));
  const [interval, setInterval] = useState<string | null>(getInterval(recurrence));
  const [amount, setAmount] = useState<string | null>(getAmount(recurrence));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | undefined, updatedRecurrence: string) => {
    try {
      const string = textFieldValue.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
      const JsTodoTxtObject = new Item(string);
      JsTodoTxtObject.setExtension('rec', updatedRecurrence);
      const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))
      setTextFieldValue(updatedString);
      ipcRenderer.send('createTodoObject', updatedString);
    } catch(error) {
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
    if(amount !== null && interval !== null) {
      const updatedValue = strictRecurrence ? '+' + amount + interval : amount + interval;
      handleChange(undefined, updatedValue);
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
            onChange={handleChange}
            value={recurrence || '-'}
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
