import React, { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Item } from 'jstodotxt';
import './DatePicker.scss';

const DatePickerComponent = ({ todoObject, type, setTextFieldValue, textFieldValue }) => {
  const initialDate = todoObject && todoObject[type]?.date && dayjs(todoObject[type].date).isValid() ? dayjs(todoObject[type].date) : null;
  const [date, setDate] = useState(initialDate);

  const handleChange = (updatedDate) => {
    if (!dayjs(updatedDate).isValid()) return;
    const formattedDate = dayjs(updatedDate).format('YYYY-MM-DD');
    const todoObjectCopy = new Item(textFieldValue);

    todoObjectCopy.setExtension(type, formattedDate);
    setDate(updatedDate);
    setTextFieldValue(todoObjectCopy.toString());
  };

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
