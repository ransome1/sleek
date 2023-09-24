import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, TextField } from '@mui/material';
import { Item } from 'jstodotxt';
import './PomodoroPicker.scss';

const PomodoraPicker = ({ 
  currentPomodoro,
  setTextFieldValue,
  textFieldValue
}) => {
  const [pomodoro, setPomodoro] = useState(currentPomodoro || 0);

  const handleChange = (event) => {
    const selectedPomodoro = event.target.value;
    setPomodoro(selectedPomodoro || 0);
  };

  useEffect(() => {
    if(pomodoro === 0) return;
    const updatedPomodoro = pomodoro || null;
    const todoObject = new Item(textFieldValue);
    todoObject.setExtension('pm', pomodoro);
    setTextFieldValue(todoObject.toString());
  }, [pomodoro]);    

  return (
      <FormControl id="pomodoroPicker">
        <TextField
          id="pomodoroPicker"
          label="Pomodoro"
          type="number"
          onChange={handleChange}
          value={pomodoro}
          inputProps={{
            min: 0,
          }}
        />
      </FormControl>
  );
};

export default PomodoraPicker;



