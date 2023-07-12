import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import { parseISO } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.scss';

const DatePickerComponent = ({ date, type, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(date ? parseISO(date) : null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateChange(date ? { date, type } : null);
  };

  const handleTextFieldClick = () => {
    setIsDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setIsDatePickerOpen(false);
  };

  return (
      <DatePicker
        className="datePicker"
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        open={isDatePickerOpen}
        onClickOutside={handleDatePickerClose}
        onFocus={handleTextFieldClick}
        customInput={<TextField id="datePicker" label={type} />}
        locale="en"
      />
  );
};

export default DatePickerComponent;
