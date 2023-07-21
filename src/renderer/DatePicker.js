import React, { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Item } from 'jstodotxt';
import './DatePicker.scss';

const DatePickerComponent = ({ todoObject, type, setTextFieldValue, textFieldValue }) => {
  const [date, setDate] = useState(todoObject && dayjs(todoObject[type]).isValid() ? dayjs(todoObject[type]) : null);

  const handleChange = (updatedDate) => {
    if(!dayjs(updatedDate).isValid()) return;
    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');
    const todoObject = new Item(textFieldValue);

    todoObject.setExtension(type, formattedDate);
    setDate(updatedDate);
    setTextFieldValue(todoObject.toString());
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en">
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={type === 't' ? 'Threshold' : 'Due'}
        value={date}
        onChange={(updatedDate) => handleChange(updatedDate)}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
