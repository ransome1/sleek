import React, { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, Chip, Box, Badge } from '@mui/material';
import { Item } from 'jstodotxt';
import { handleFilterSelect } from '../Shared';
import dayjs from 'dayjs';

const { ipcRenderer } = window.api;

interface Props {
  type: string;
  todoObject: TodoObject;
  date: Date;
  filters: Filters;
  settings: Settings;
}

const DatePickerInline: React.FC<Props> = ({
  type,
  todoObject,
  date,
  filters,
  settings,
}) => {
	const [open, setOpen] = useState(false);
  const chipText = type === 'due' ? "due:" : type === 't' ? "t:" : null;

  const handleChange = (date: dayjs.Dayjs | null) => {
    if(!date || !dayjs(date).isValid() || !todoObject.id) return;
    const validDate = dayjs(date).format('YYYY-MM-DD');

    const string = todoObject.string.replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);

    const JsTodoTxtObject = new Item(string);
    JsTodoTxtObject.setExtension(type, validDate);

    const updatedString = JsTodoTxtObject.toString().replaceAll(` ${String.fromCharCode(16)} `, String.fromCharCode(16))

    ipcRenderer.send('writeTodoToFile', todoObject.id, updatedString);

    setOpen(false);
  };

  const DatePickerInline = ({ date, ...props }) => {
    const parsedDate = dayjs(date);

    const ButtonField = ({ date, ...props }) => {
      const { setOpen, disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {} } = props;
      const mustNotify = (type === 'due') ? !todoObject?.notify : true;

      return (
        <Button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel}>
          <Badge variant="dot" invisible={mustNotify}>
            <Chip onClick={() => handleFilterSelect(type, date, filters, false)} label={chipText} />
            <Box onClick={() => setOpen?.((prev) => !prev)}>{date}</Box>
          </Badge>
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={settings.language}>
      <DatePickerInline
        onChange={handleChange}
        date={date}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInline;
