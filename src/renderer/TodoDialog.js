import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Alert } from '@mui/material';
import AutoSuggest from './AutoSuggest';

const ipcRenderer = window.electron.ipcRenderer;

const TodoDialog = ({ setDialogOpen, todoObject, filters }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setDialogOpen(false);
  };

  const handleAdd = async () => {
    try {
      const string = textFieldValue;
      const id = todoObject?.id || '';

      await ipcRenderer.send('writeTodoToFile', id, string);

      setOpen(false);
      setDialogOpen(false);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} className="addTodo">
      <DialogContent>
        <AutoSuggest todoObject={todoObject} setDialogOpen={setDialogOpen} filters={filters}  />
        {error && <Alert severity="error">Error: {error.message}</Alert>}
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
