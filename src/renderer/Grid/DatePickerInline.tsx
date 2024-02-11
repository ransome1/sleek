import React, { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import { handleFilterSelect } from '../Shared';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

const { ipcRenderer } = window.api;

interface Props {
  type: string;
  todoObject: TodoObject;
  date: string | null;
  filters: Filters | null;
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

  if(settings.useHumanFriendlyDates) {
    dayjs.locale(settings.language);
    dayjs.extend(relativeTime);
    dayjs.extend(duration);
  }

  const handleChange = (date: dayjs.Dayjs | null) => {
    try {
      ipcRenderer.send('writeTodoToFile', todoObject.id, todoObject.string, false, type, dayjs(date).format('YYYY-MM-DD'));
    } catch(error: any) {
      console.error(error);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setOpen?.((prev) => !prev)
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault();
    if(event.key === 'Enter') {
      setOpen?.((prev) => !prev)
    }
  };

  const DatePickerInline = ({ ...props }) => {
    const ButtonField = ({ ...props }) => {
      const { disabled, InputProps: { ref } = {}, inputProps: { 'aria-label': ariaLabel } = {} } = props;
      const mustNotify = (type === 'due') ? !todoObject?.notify : true;
      const friendlyDate = settings.useHumanFriendlyDates ? dayjs(date).fromNow() : null;
      return (
        <Button id={props.id} disabled={disabled} ref={ref} aria-label={ariaLabel} tabIndex={-1}>
          <Badge variant="dot" invisible={mustNotify}>
            <Chip
              onClick={() => handleFilterSelect(type, date, filters, false)}
              label={chipText}
              data-testid={`datagrid-button-${type}`}
              tabIndex={0}
            />
            <div
              onClick={(event) => handleClick(event)}
              onKeyDown={(event) => handleKeyDown(event)}
              data-testid={`datagrid-picker-date-${type}`}
              tabIndex={0}
            >
              {(friendlyDate) ? friendlyDate : date}
            </div>
          </Badge>
        </Button>
      );
    };
    return (
      <DatePicker
        slots={{ 
          field: ButtonField,
          ...props.slots
        }}
        slotProps={{ field: { setOpen, date } }}
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        value={dayjs(date)}
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
