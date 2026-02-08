import React from 'react'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import PomodoroIcon from '../../../resources/pomodoro.svg?asset'
import './PomodoroPicker.scss'

interface PomodoroPickerComponentProps {
  pomodoro: number | string
  handleChange: (key: string, value: string | number) => void
}

const PomodoroPickerComponent: React.FC<PomodoroPickerComponentProps> = ({
  pomodoro,
  handleChange
}) => {
  const handlePomodoroChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    handleChange('pm', event.target.value)
  }

  return (
    <FormControl id="pomodoroPicker">
      <TextField
        id="pomodoroPicker"
        label={<img src={PomodoroIcon} />}
        type="number"
        onChange={handlePomodoroChange}
        value={pomodoro}
        data-testid="dialog-picker-pomodoro"
        slotProps={{
          htmlInput: {
            min: 0
          }
        }}
      />
    </FormControl>
  );
}

export default PomodoroPickerComponent
