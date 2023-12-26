import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import './PomodoroPicker.scss';

const { ipcRenderer } = window.api;

interface Props {
  pomodoro: number;
  textFieldValue: string;
  todoObject: TodoObject;
}

const PomodoroPicker: React.FC<Props> = ({
  pomodoro,
  textFieldValue,
  todoObject,
}) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      ipcRenderer.send('updateTodoObject', todoObject?.id, textFieldValue, 'pm', event.target.value);
    } catch(error) {
      console.error(error);
    }
  };

  return (
      <FormControl id="pomodoroPicker">
        <TextField
          id="pomodoroPicker"
          label={<TomatoIconDuo />}
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
