import React, { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Item } from 'jstodotxt';

import './DatePicker.scss';

const DatePickerComponent = ({ currentDate, type, setTextFieldValue, textFieldValue }) => {
  const [date, setDate] = useState(currentDate ? dayjs(currentDate) : null);

  const handleChange = (updatedDate) => {
    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');
    if(dayjs(formattedDate).isValid()) setDate(formattedDate)
  };

  useEffect(() => {
    const todoObject = new Item(textFieldValue);
    todoObject.setExtension(type, dayjs(date).format('YYYY-MM-DD'));
    if(date !== null) setTextFieldValue(todoObject.toString());
  }, [date]);  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={type === 't' ? 'Threshold' : 'Due'}
        value={date}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;