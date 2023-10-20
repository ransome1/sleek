import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, TextField } from '@mui/material';
import { Item } from 'jstodotxt';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import './PomodoroPicker.scss';

interface PomodoroPicker {
  JsTodoTxtObject: object | null;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
}

const PomodoroPicker: PomodoroPicker = ({ 
  todoObject,
  setTextFieldValue,
  textFieldValue
}) => {
  const [pomodoro, setPomodoro] = useState<string | null>(todoObject?.pm || 0);

  const handleChange = (event) => {
    const updatedPomodoro = event.target.value;
    let string = textFieldValue.replaceAll('\n', ` ${String.fromCharCode(16)}`);
    const JsTodoTxtObject = new Item(string);
    JsTodoTxtObject.setExtension('pm', updatedPomodoro);
    setTextFieldValue(JsTodoTxtObject.toString());
    setPomodoro(updatedPomodoro);
  };

  return (
      <FormControl id="pomodoroPicker">
        <TextField
          id="pomodoroPicker"
          label=<TomatoIconDuo />
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

export default PomodoroPicker;