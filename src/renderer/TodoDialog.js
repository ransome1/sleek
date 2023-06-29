import React, { useState, useRef } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Alert, TextField } from '@mui/material';

const TodoDialog = ({ setDialogOpen, todoTxtObject }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(null);
  const textFieldRef = useRef(null);

  const handleClose = () => {
    setOpen(false);
    setDialogOpen(false);
  };

  const handleAdd = async () => {
    try {
      const string = textFieldRef.current.value;
      const id = textFieldRef.current.id;

      const response = await new Promise((resolve, reject) => {
        window.electron.ipcRenderer.once('successWritingToFile', resolve);
        window.electron.ipcRenderer.once('errorWritingToFile', reject);
        window.electron.ipcRenderer.send('writeTodoToFile', id, string);
      });

      setOpen(false);
      setDialogOpen(false);
    } catch (error) {
      setError(error);
    }
  };

   const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  }; 

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id={todoTxtObject?.id || ''}
          type="text"
          fullWidth
          variant="outlined"
          defaultValue={todoTxtObject?.string || ''}
          inputRef={textFieldRef}
          onKeyDown={handleKeyDown}
        />
        {error && <Alert severity="error">Error: {error.message}</Alert>}
      </DialogContent>
      <DialogActions>
        {todoTxtObject?.id ? (
          <>
            <Button onClick={handleAdd}>Edit</Button>
          </>
        ) : (
          <>
            <Button onClick={handleAdd}>Add</Button>
          </>
        )}
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoDialog;
