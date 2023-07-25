import React, { useState, useRef, useEffect } from 'react';
import { FormControl, TextField, FormControlLabel, Radio, RadioGroup, Checkbox, Badge } from '@mui/material';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import Popover from '@mui/material/Popover';
import { Item } from 'jstodotxt';
import './RecurrencePicker.scss';

const RecurrencePicker = ({ currentRecurrence, setTextFieldValue, textFieldValue }) => {
  const recurrenceFieldRef = useRef(null);
  const [recurrence, setRecurrence] = useState(currentRecurrence || null);
  const [interval, setInterval] = useState(
    currentRecurrence && currentRecurrence.startsWith('+') ? currentRecurrence.slice(2, 3) : currentRecurrence ? currentRecurrence.slice(1, 2) : null
  );
  const [amount, setAmount] = useState(
    currentRecurrence && currentRecurrence.startsWith('+') ? currentRecurrence.slice(1, 2) : currentRecurrence ? currentRecurrence.slice(0, 1) : null
  );
  const [strictRecurrence, setStrictRecurrence] = useState(currentRecurrence ? currentRecurrence.startsWith('+') : false);

  const handleChange = (event) => {
    const updatedValue = event.target.value;
    setRecurrence(updatedValue);
  };

  const handleIntervalChange = (event) => {
    if(!amount) setAmount(1)
    setInterval(event.target.value);
  };

  const handleAmountChange = (event) => {
    if(!interval) setInterval('d')
    setAmount(event.target.value);
  };

  const handleStrictRecurrenceChange = (event) => {
    if(!recurrence) return;
    setStrictRecurrence(event.target.checked);
    if(recurrence.startsWith('+')) {
      setRecurrence(recurrence.substr(1));
    } else {
      setRecurrence('+' + recurrence);
    }
  };

  const handleBadgeClick = (event) => {
    const url = 'https://github.com/ransome1/sleek/wiki/Recurring-todos-(rec:)';
    window.open(url);
  };

  useEffect(() => {
    const updatedValue = (strictRecurrence) ? '+' + amount + interval : amount + interval;
    setRecurrence(updatedValue);
  }, [amount]);

  useEffect(() => {
    const updatedValue = (strictRecurrence) ? '+' + amount + interval : amount + interval;
    setRecurrence(updatedValue);
  }, [interval]);

  useEffect(() => {
    if(!recurrence) return;
    const todoObject = new Item(textFieldValue);
    todoObject.setExtension('rec', recurrence);

    setTextFieldValue(todoObject.toString());
    setStrictRecurrence(recurrence.startsWith('+'))

    recurrenceFieldRef.current.value = recurrence;
  }, [recurrence]);


  useEffect(() => {
    const handleEnterKeyPress = (event) => {
      if(event.key === 'Enter') {
        event.preventDefault();
        if (recurrenceFieldRef.current) {
          recurrenceFieldRef.current.click();
        }
      }
    };

    recurrenceFieldRef.current.addEventListener('keydown', handleEnterKeyPress);

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
            label="Recurrence"
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
                label="Every"
                type="number"
                onChange={handleAmountChange}
                defaultValue={amount || 1}
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
                <FormControlLabel value="d" control={<Radio />} label="day" />
                <FormControlLabel value="b" control={<Radio />} label="business day" />
                <FormControlLabel value="w" control={<Radio />} label="week" />
                <FormControlLabel value="m" control={<Radio />} label="month" />
                <FormControlLabel value="y" control={<Radio />} label="year" />
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
                label="Strict"
              />
            </FormControl>
          </Popover>
        </FormControl>
      )}
    </PopupState>
  );
};

export default RecurrencePicker;
