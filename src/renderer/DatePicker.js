import React, { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { Item } from 'jstodotxt';
import './DatePicker.scss';

const ipcRenderer = window.electron.ipcRenderer;

const DatePickerComponent = ({ currentDate, type, setTextFieldValue, inline, todoObject }) => {
  const [date, setDate] = useState(currentDate ? dayjs(currentDate) : null);

  const handleChange = (updatedDate) => {
    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');
    if (dayjs(formattedDate).isValid()) {
      setDate(formattedDate);
    }
  };

  const ButtonDatePicker = ({ date, ...props }) => {
    const [open, setOpen] = useState(false);

    return (
      <DatePicker
        slots={{ field: ButtonField, ...props.slots }}
        slotProps={{ field: { setOpen, date } }}
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      />
    );
  };

  const ButtonField = ({ date, ...props }) => {
    const { setOpen, disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {} } = props;
    if(!date) return;
    return (
      <Button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel} onClick={() => setOpen?.((prev) => !prev)}>
        <FontAwesomeIcon data-testid="fa-icon-clock" icon={faClock} />
        {dayjs(date).format('YYYY-MM-DD')}
      </Button>
    );
  };

  useEffect(() => {
    if (!inline) {
      const updatedTodoObject = new Item(todoObject?.string || '');
      updatedTodoObject.setExtension(type, dayjs(date).format('YYYY-MM-DD'));
      if (date !== null) setTextFieldValue(updatedTodoObject.toString());
    } else {
      const updatedTodoObject = new Item(todoObject?.string || '');
      updatedTodoObject.setExtension(type, dayjs(date).format('YYYY-MM-DD'));
      ipcRenderer.send('writeTodoToFile', todoObject?.id || '', updatedTodoObject.toString());
    }
  }, [date]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
      {inline ? (
        <ButtonDatePicker date={date} onChange={handleChange} />
      ) : (
        <DatePicker
          className="datePicker"
          format="YYYY-MM-DD"
          label={type === 't' ? 'Threshold' : 'Due'}
          value={date}
          onChange={handleChange}
        />
      )}
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
