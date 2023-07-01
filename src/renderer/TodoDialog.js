import React, { useState, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Button, Dialog, DialogContent, DialogActions, Alert } from '@mui/material';
import './TodoDialog.scss';

const TodoDialog = ({ setDialogOpen, todoTxtObject }) => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState(null);
  const textFieldRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState(todoTxtObject?.string || '');

  const handleClose = () => {
    setOpen(false);
    setDialogOpen(false);
  };

  const handleAdd = async () => {
    try {
      const string = textFieldRef.current.value;
      const id = todoTxtObject?.id || '';
      await new Promise((resolve, reject) => {
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
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (suggestions.length > 0) {
        const selectedIndex = suggestions.findIndex((suggestion) => suggestion === value);
        const nextIndex = (selectedIndex + 1) % suggestions.length;
        const selectedSuggestion = suggestions[nextIndex];
        if (selectedSuggestion) {
          const words = value.trim().split(' ');
          words[words.length - 1] = selectedSuggestion;
          const newValue = words.join(' ');
          setValue(newValue);
        }
      }
    }
  };

  const handleChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const handleSuggestionsFetchRequested = ({ value }) => {
    const words = value.trim().split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('B')) {
      const suggestions = getSuggestions(lastWord);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = (event, { suggestion }) => {
    if (event.keyCode === 40) {
      event.preventDefault();
      return;
    }

    const inputValue = value.trim();
    const lastSpaceIndex = inputValue.lastIndexOf(' ');
    const newValue =
      lastSpaceIndex === -1 ? suggestion : inputValue.substring(0, lastSpaceIndex + 1) + suggestion;

    setValue(newValue);
  };

  const getSuggestions = (value) => {
    const suggestions = ['Apple', 'Banana', 'Orange', 'Banana1', 'Banana2', 'Banana3', 'Banana4'];
    return suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
  };

  const renderSuggestion = (suggestion) => {
    return <span>{suggestion}</span>;
  };

  const inputProps = {
    placeholder: `(A) Todo text +project @context due:2020-12-12 rec:d`,
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    ref: textFieldRef,
    autoFocus: true,
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={handleSuggestionsClearRequested}
          onSuggestionSelected={handleSuggestionSelected}
          getSuggestionValue={(suggestion) => suggestion}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          closeMenuOnSelect={false}
        />
        {error && <Alert severity="error">Error: {error.message}</Alert>}
      </DialogContent>
      <DialogActions>
        {todoTxtObject?.id ? (
          <>
            <Button onClick={handleAdd} id={todoTxtObject.id}>Edit</Button>
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
