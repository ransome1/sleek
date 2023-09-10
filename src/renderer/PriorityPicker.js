import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Item } from 'jstodotxt';
import './PriorityPicker.scss';

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

const priorities = [{ value: '-', label: '-' }, ...alphabetArray.map((letter) => ({ value: letter, label: letter }))];

const PriorityPicker = ({ currentPriority, setTextFieldValue, textFieldValue }) => {
  const [priority, setPriority] = useState(currentPriority || '-');

  const handleChange = (event) => {
    const updatedPriority = event.target.value;
    setPriority(updatedPriority);
  };

  useEffect(() => {
    const updatedPriority = priority === '-' ? null : priority;
    const todoObject = new Item(textFieldValue);
    todoObject.setPriority(updatedPriority);
    setTextFieldValue(todoObject.toString());
  }, [priority]);  

  return (
      <FormControl id="priorityPicker" className="priorityPicker">
        <InputLabel>Priority</InputLabel>
        <Select
          labelId="priorityPicker"
          id="priorityPicker"
          label="Priority"
          value={priority}
          onChange={handleChange}
        >
          {priorities.map((priority) => (
            <MenuItem key={priority.value} value={priority.value}>
              {priority.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
};

export default PriorityPicker;