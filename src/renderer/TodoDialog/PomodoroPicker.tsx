import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { Item } from 'jstodotxt';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import './PomodoroPicker.scss';

interface Props {
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
  pomodoro: number;
  setPomodoro: React.Dispatch<React.SetStateAction<number>>;
}

const { ipcRenderer } = window.api;

const PomodoroPicker: React.FC<Props> = ({
  setTextFieldValue,
  textFieldValue,
  pomodoro,
}) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const string = textFieldValue.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
      const JsTodoTxtObject = new Item(string);
      JsTodoTxtObject.setExtension('pm', event.target.value);
      const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))
      setTextFieldValue(updatedString);
      ipcRenderer.send('createTodoObject', updatedString);
    } catch(error) {
      console.error(error);
    }
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
