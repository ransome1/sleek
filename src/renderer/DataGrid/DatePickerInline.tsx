import React, { useState, useEffect, useRef } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, Chip, Box } from '@mui/material';
import { Item } from 'jstodotxt';
import { handleFilterSelect } from '../Shared';
import dayjs from 'dayjs';

const { ipcRenderer, store } = window.api;

const DatePickerInline: React.FC<DatePicker> = ({
  type,
  todoObject,
  date,
  filters
}) => {
	const [open, setOpen] = useState(false);
  const datePickerRef = useRef(null);
  const chipText = type === 'due' ? "due:" : type === 't' ? "t:" : null;

  const handleChange = (updatedDate: dayjs.Dayjs | null) => {
    if (!updatedDate || !dayjs(updatedDate).isValid()) return;

    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');

    if (todoObject?.dueString) {
      const stringToReplace = ` ${type}:${todoObject.dueString}`;
      todoObject.string = todoObject.string.replace(stringToReplace, '');
    }

    const JsTodoTxtObject = new Item(todoObject.string);
    JsTodoTxtObject.setExtension(type, formattedDate);

    setOpen(false);
    ipcRenderer.send('writeTodoToFile', todoObject.id, JsTodoTxtObject.toString());
  };

  const DatePickerInline = ({ date, ...props }) => {

    const parsedDate = dayjs(date);
  
    const ButtonField = ({ date, ...props }) => {
      const { setOpen, disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {} } = props;

      return (
        <Button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel}>
          <Chip onClick={() => handleFilterSelect(type, date, filters, false)} label={chipText} />
          <Box onClick={() => setOpen?.((prev) => !prev)}>{date}</Box>
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
        value={parsedDate}
      />
    );
  };

  const selectedLanguage = store.get('language');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={selectedLanguage}>
      <DatePickerInline
        onChange={handleChange}
        date={date}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInline;
