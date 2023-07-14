import React, { useState, useRef } from 'react';
import { FormControl, InputLabel, TextField, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import Popover from '@mui/material/Popover';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import './RecurrencePicker.scss';

let interval = 'd';
let amount = 1;

const RecurrencePicker = ({ currentRecurrence, onChange }) => {
  const textFieldRef = useRef(null);

  const handleChange = (event) => {
    const updatedValue = event.target.value;
    onChange(updatedValue);
  };

  const handleIntervalChange = (event) => {
    interval = event.target.value;
    const updatedValue = amount + interval;
    onChange(updatedValue);
    textFieldRef.current.value = updatedValue;
  };

  const handleAmountChange = (event) => {
    amount = event.target.value;
    const updatedValue = amount + interval;
    onChange(updatedValue);
    textFieldRef.current.value = updatedValue;
  };

  return (
    <PopupState variant="popover" popupId="recurrencePicker">
      {(popupState) => (
        <FormControl>
          <TextField
            label="Recurrence"
            className="recurrencePicker"
            onChange={handleChange}
            defaultValue={currentRecurrence || '-'}
            inputRef={textFieldRef}
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
                defaultValue={currentRecurrence ? currentRecurrence.slice(0, -1) : '1'}
                className="recurrencePickerPopupInput"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl>
              <RadioGroup
                aria-labelledby="recurrencePickerRadioGroup"
                defaultValue={currentRecurrence ? currentRecurrence.slice(-1) : 'd'}
                onChange={handleIntervalChange}
              >
                <FormControlLabel value="d" control={<Radio />} label="day" />
                <FormControlLabel value="b" control={<Radio />} label="business day" />
                <FormControlLabel value="w" control={<Radio />} label="week" />
                <FormControlLabel value="m" control={<Radio />} label="month" />
                <FormControlLabel value="y" control={<Radio />} label="year" />
              </RadioGroup>
            </FormControl>
          </Popover>
        </FormControl>
      )}
    </PopupState>
  );
};

export default RecurrencePicker;
