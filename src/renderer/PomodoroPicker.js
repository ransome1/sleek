import React, { useState } from 'react';
import { FormControl, InputLabel, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPizzaSlice } from '@fortawesome/free-solid-svg-icons';
import './PomodoroPicker.scss';

const PomodoraPicker = ({ currentPomodoro, onChange }) => {
  const [pomodoro, setPomodoro] = useState(currentPomodoro || 0);

  const handleChange = (event) => {
    const selectedPomodoro = event.target.value;
    setPomodoro(selectedPomodoro)
    onChange(selectedPomodoro)
  };

  return (
      <FormControl id="pomodoroPicker">
        <TextField
          id="pomodoroPicker"
          label=<FontAwesomeIcon data-testid='fa-icon-pizza-slice' icon={faPizzaSlice} />
          type="number"
          onChange={handleChange}
          defaultValue="0"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>
  );
};

export default PomodoraPicker;



