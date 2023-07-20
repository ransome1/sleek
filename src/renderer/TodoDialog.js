import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, FormControl } from '@mui/material';
import AutoSuggest from './AutoSuggest';
import PriorityPicker from './PriorityPicker';
import DatePicker from './DatePicker';
import PomodoroPicker from './PomodoroPicker';
import RecurrencePicker from './RecurrencePicker';
import './TodoDialog.scss';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ dialogOpen, setDialogOpen, todoObject, attributes, setSnackBarSeverity, setSnackBarContent, setSnackBarOpen }) => {
  const [textFieldValue, setTextFieldValue] = useState(todoObject?.string || '');
  const textFieldRef = useRef(null);
  const textFieldValueRef = useRef(textFieldValue);

  const handleAdd = async () => {
    if (!textFieldValueRef.current.trim()) {
      setSnackBarSeverity('info');
      setSnackBarContent('Please enter something into the text field');
      setSnackBarOpen(true);
      return;
    }
    try {
      setDialogOpen(false);
      await ipcRenderer.send('writeTodoToFile', todoObject?.id || '', textFieldValueRef.current);
    } catch (error) {
      setSnackBarSeverity('error');
      setSnackBarContent('Error');
      setSnackBarOpen(true);
    }
  };

  useEffect(() => {
    textFieldValueRef.current = textFieldValue;
  }, [textFieldValue]);

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} id='todoDialog'>
      <DialogContent>
        <AutoSuggest
          attributes={attributes}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          textFieldRef={textFieldRef}
          todoObject={todoObject}
          setDialogOpen={setDialogOpen}
          handleAdd={handleAdd}
        />

        <PriorityPicker currentPriority={todoObject?.priority} setTextFieldValue={setTextFieldValue} textFieldValue={textFieldValue} />

        <DatePicker currentDate={todoObject?.due} type="due" setTextFieldValue={setTextFieldValue} textFieldValue={textFieldValue} />

        <DatePicker currentDate={todoObject?.t} type="t" setTextFieldValue={setTextFieldValue} textFieldValue={textFieldValue} />

        <RecurrencePicker currentRecurrence={todoObject?.rec} setTextFieldValue={setTextFieldValue} textFieldValue={textFieldValue} />

        <PomodoroPicker currentPomodoro={todoObject?.pm} setTextFieldValue={setTextFieldValue} textFieldValue={textFieldValue} />
  
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAdd}>Save</Button>
        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDialog;
