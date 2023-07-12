import React, { useState, useRef, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Alert, Tooltip } from '@mui/material';
import AutoSuggest from './AutoSuggest';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ dialogOpen, setDialogOpen, todoObject, filters, setSnackBarSeverity, setSnackBarContent, setSnackBarOpen }) => {
  const textFieldRef = useRef(null);


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
    <Dialog open={dialogOpen} onClose={handleClose} className='addTodo'>
      <DialogContent>
        <AutoSuggest textFieldRef={textFieldRef} todoObject={todoObject} setDialogOpen={setDialogOpen} filters={filters}  />
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
