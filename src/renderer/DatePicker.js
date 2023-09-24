import React, { useState, useEffect } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/cs';
import 'dayjs/locale/es';
import 'dayjs/locale/hu';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/zh';
import { Item } from 'jstodotxt';
import './DatePicker.scss';

const userLocale = navigator.language || navigator.userLanguage;

const DatePickerComponent = ({ 
  todoObject,
  type,
  setTextFieldValue,
  textFieldValue
}) => {
  const initialDate = todoObject && todoObject[type] && dayjs(todoObject[type]).isValid() ? dayjs(todoObject[type]) : null;
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={userLocale}>
      <DatePicker
        className="datePicker"
        format="YYYY-MM-DD"
        label={type === 't' ? 'Threshold' : 'Due'}
        value={initialDate}
        onChange={(updatedDate) => handleChange(updatedDate)}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
