import React, { useState, useEffect, useRef } from 'react';
import { Button, Chip, Box, TextField, InputAdornment } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './Search.scss';

const Search = ({ headers }) => {
  const [inputString, setInputString] = useState('');
  const [showAddTodoButton, setShowAddTodoButton] = useState(false);
  const searchFieldRef = useRef(null);
  const addTodoButton = document.getElementById("addTodoButton");
  const label = (headers.availableObjects) ? "Showing " + headers.visibleObjects + " of " + headers.availableObjects : null

  useEffect(() => {
    searchFieldRef.current?.focus();
  }, [inputString]);

  useEffect(() => {
    const errorHandler = () => console.log(error);
    window.electron.ipcRenderer.on('mainProcessError', errorHandler);

    return () => {
      window.electron.ipcRenderer.off('mainProcessError', errorHandler);
    };
  }, []);

  const handleInput = (event) => {
    const searchString = event.target.value.toLowerCase();
    (searchString) ? setShowAddTodoButton(true) : setShowAddTodoButton(false)
    setInputString(searchString);
  };

  const handleSearch = () => {
    window.electron.ipcRenderer.send('applySearchString', inputString);
  };

  const handleChipClick = () => {
    window.electron.ipcRenderer.send('writeTodoToFile', undefined, inputString);
    setShowAddTodoButton(false);
    setInputString('');
  };

  const handleXClick = (event) => {
    setShowAddTodoButton(false);
    setInputString('');
    window.electron.ipcRenderer.send('applySearchString', '');
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      handleSearch();
    }, 200);
    return () => clearTimeout(delayTimer);
  }, [inputString]);

  return (
    <Box className="search">
      <TextField
        variant="outlined"
        placeholder="(A) Todo text +project @context due:2022-12-12 rec:d h:0 t:2022-12-12"
        onChange={handleInput}
        label={label}
        inputRef={searchFieldRef}
        value={inputString}
        InputProps={{
          startAdornment: 
            <InputAdornment position="start">
              <FontAwesomeIcon data-testid='fa-icon-search' icon={faSearch} />
            </InputAdornment>,
          endAdornment:
            <InputAdornment position="end">
              <Chip id="addTodoButton" aria-hidden={showAddTodoButton} label="Add as todo" onClick={handleChipClick} />
              <Button onClick={handleXClick}>
                <FontAwesomeIcon data-testid='fa-icon-circle-xmark' icon={faCircleXmark} />
              </Button>
            </InputAdornment>,
        }}
      />
    </Box>
  );
};

export default Search;