import React, { useState, useRef } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Box, FormControl, Select, InputLabel, MenuItem } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import { formatDate } from './util.ts';
import { Item } from 'jsTodoTxt';
import './TodoDialog.scss';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ dialogOpen, setDialogOpen, todoObject, filters, setSnackBarSeverity, setSnackBarContent, setSnackBarOpen }) => {
  const textFieldRef = useRef(null);
  const [textFieldValue, setTextFieldValue] = useState(todoObject?.string || '');

  const handlePriorityChange = (priority) => {
    const updatedTodoObject = new Item(textFieldValue);
    updatedTodoObject.setPriority(priority === '-' ? null : priority);
    setTextFieldValue(updatedTodoObject.toString())
  };

  const handleDateChange = (response) => {
    const updatedTodoObject = new Item(textFieldValue);
    updatedTodoObject.setExtension(response.type, formatDate(response.date));
    setTextFieldValue(updatedTodoObject.toString());
  }; 

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleAdd = async () => {
    try {
      const inputValue = textFieldRef.current?.value;
      if(inputValue === '') {
        setSnackBarSeverity('info');
        setSnackBarContent('Please enter something into the text field');
        setSnackBarOpen(true);
        return;
      }
      const id = todoObject?.id || '';
      await ipcRenderer.send('writeTodoToFile', id, inputValue);
      setDialogOpen(false)
    } catch (error) {
      setSnackBarSeverity('error');
      setSnackBarContent('Error');
      setSnackBarOpen(true);
    }
  };

  return (
    <Dialog open={dialogOpen} onClose={handleClose} className='TodoDialog'>
      <DialogContent>
        <AutoSuggest textFieldValue={textFieldValue} setTextFieldValue={setTextFieldValue} textFieldRef={textFieldRef} todoObject={todoObject} setDialogOpen={setDialogOpen} filters={filters}  />

        <PriorityPicker currentPriority={todoObject?.priority} onPriorityChange={handlePriorityChange} />

        <DatePicker date={todoObject?.due} type="due" onDateChange={(date) => handleDateChange(date, "due")} />

        <DatePicker date={todoObject?.t} type="t" onDateChange={(date) => handleDateChange(date, "t")} />

      </DialogContent>
      <DialogActions>
        {todoObject?.id ? (
          <Button onClick={handleAdd} id={todoObject.id}>
            Edit
          </Button>
        ) : (
          <Button onClick={handleAdd}>Add</Button>
        )}
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDialog;
