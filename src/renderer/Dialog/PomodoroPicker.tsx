import React from 'react';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
//import TomatoIconDuo from '../../../assets/icons/tomato-duo.svg';
import TomatoIconDuo from '../public/tomato-duo.svg?asset'
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
          label={<img src={TomatoIconDuo} width={30} height={30} />}
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
