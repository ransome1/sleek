import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, FormControl } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import './TodoDialog.scss';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ 
  dialogOpen,
  setDialogOpen,
  todoObject,
  attributes,
  setSnackBarSeverity,
  setSnackBarContent,
  textFieldValue,
  setTextFieldValue,
  shouldUseDarkColors
}) => {
  
  const textFieldRef = useRef(null);
  
  const handleAdd = () => {
    try {
      if (textFieldRef.current.value === '') {
        setSnackBarSeverity('info');
        setSnackBarContent('Please enter something into the text field');
        return false;
      }
      ipcRenderer.send('writeTodoToFile', todoObject?.id, textFieldRef.current.value);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWriteTodoToFile = function(response) {
    if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
    } else {
      setDialogOpen(false);
    }
  }

  useEffect(() => {
    ipcRenderer.on('writeTodoToFile', handleWriteTodoToFile);
  }, []);

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} id='todoDialog' className={shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}>
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldRef={textFieldRef}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          todoObject={todoObject}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
        />
        <PriorityPicker
          currentPriority={todoObject?.priority}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <DatePicker
          todoObject={todoObject}
          type="due"
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <DatePicker
          todoObject={todoObject}
          type="t"
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <RecurrencePicker
          currentRecurrence={todoObject?.rec}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
        <PomodoroPicker
          currentPomodoro={todoObject?.pm}
          setTextFieldValue={setTextFieldValue}
          textFieldValue={textFieldValue}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleAdd}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDialog;
