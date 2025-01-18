import React from 'react'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import TomatoIconDuo from '../tomato-duo.svg?asset'
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
        label={<img src={TomatoIconDuo} width={30} height={30} />}
        type="number"
        onChange={handlePomodoroChange}
        value={pomodoro}
        data-testid="dialog-picker-pomodoro"
        inputProps={{
          min: 0
        }}
      />
    </FormControl>
  )
}

export default PomodoroPickerComponent
