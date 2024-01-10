import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg'
import './PomodoroPicker.scss';

interface PomodoroPickerProps {
  pomodoro: number | string;
  handleChange: Function;
}

const PomodoroPicker: React.FC<PomodoroPickerProps> = ({
  pomodoro,
  handleChange,
}) => {
  return (
      <FormControl id="pomodoroPicker">
        <TextField
          id="pomodoroPicker"
          label={<TomatoIconDuo />}
          type="number"
          onChange={(event) => handleChange('pm', event.target.value)}
          value={pomodoro}
          data-testid="dialog-picker-pomodoro"
          inputProps={{
            min: 0,
          }}
        />
      </FormControl>
  );
};

export default PomodoroPicker;
