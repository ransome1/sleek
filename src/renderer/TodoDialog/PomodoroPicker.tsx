import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import './PomodoroPicker.scss';

interface Props {
  pomodoro: number;
  refreshTextFieldValue: (type: string, value: any) => void;
}

const PomodoroPicker: React.FC<Props> = ({
  pomodoro,
  refreshTextFieldValue,
}) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      refreshTextFieldValue('pm', event.target.value);
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
