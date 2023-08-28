import React, { useState, useEffect, useRef } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, Chip } from '@mui/material';
import dayjs from 'dayjs';
import { Item } from 'jstodotxt';

const ipcRenderer = window.electron.ipcRenderer;

const DatePickerInline = ({ type, todoObject, date }) => {
	const [open, setOpen] = useState(false);
  const datePickerRef = useRef(null);
  const chipText = type === 'due' ? "Due" : type === 't' ? "Threshold" : null;

  const handleChange = (date) => {
    const updatedDate = dayjs(date).format('YYYY-MM-DD');
    const updatedTodoObject = new Item(todoObject.string || '');
    updatedTodoObject.setExtension(type, updatedDate);
    setOpen(false);
    ipcRenderer.send('writeTodoToFile', todoObject.id, updatedTodoObject.toString());
  };

  const DatePickerInline = ({ date, ...props }) => {
  
    const ButtonField = ({ date, ...props }) => {
      const { setOpen, disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {} } = props;

      return (
        <Button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel} onClick={() => setOpen?.((prev) => !prev)}>
          <Chip label={chipText} />
          {date}
        </Button>
      );
    };

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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
      <DatePickerInline
        onChange={handleChange}
        date={date}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInline;
