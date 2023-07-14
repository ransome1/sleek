import React, { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import './DatePicker.scss';

const DatePickerComponent = ({ date, type, onChange }) => {
  const initialValue = date ? dayjs(date) : null;
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue) => {
    const formattedDate = dayjs(newValue).format('YYYY-MM-DD');
    if (!dayjs(formattedDate).isValid()) {
      return;
    }
    setValue(dayjs(formattedDate));
    onChange(formattedDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={type === 't' ? 'Threshold' : 'Due'}
        value={value}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
