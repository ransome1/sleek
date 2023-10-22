import React, { useState } from 'react';
import { FormControl, TextField } from '@mui/material';
import { Item } from 'jstodotxt';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import { TodoObject } from '../../main/util'
import './PomodoroPicker.scss';

interface Props {
  todoObject: TodoObject | null;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  textFieldValue: string;
}

const PomodoroPicker: React.FC<Props> = ({
  todoObject,
  setTextFieldValue,
  textFieldValue
}) => {
  const [pomodoro, setPomodoro] = useState<number | null>(todoObject?.pm || 0);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
