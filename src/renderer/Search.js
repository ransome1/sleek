import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, Chip, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './Search.scss';

const ipcRenderer = window.electron.ipcRenderer;

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const Search = ({ headers, setInputString, inputString }) => {
  const searchFieldRef = useRef(null);
  const [showAddTodoButton, setShowAddTodoButton] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    searchFieldRef.current?.focus();
    setShowAddTodoButton(inputString.length > 0);
  }, [inputString]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        searchFieldRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const delayedSearch = debounce(handleSearch, 200);
    delayedSearch();

    return delayedSearch.cancel;
  }, [inputString]);

  const handleInput = (event) => {
    const searchString = event.target.value.toLowerCase();
    setInputString(searchString);
  };

  const handleSearch = () => {
    ipcRenderer.send('applySearchString', inputString);
  };

  const resetInputString = () => {
    setInputString('');
    ipcRenderer.send('applySearchString', '');
  };

  const handleFilterSelect = () => {
    ipcRenderer.send('writeTodoToFile', undefined, inputString);
    resetInputString();
  };

  const handleXClick = () => {
    resetInputString();
  };

  const label = headers.availableObjects ? `Showing ${headers.visibleObjects} of ${headers.availableObjects}` : null;

  return (
    <Box id='search'>
      <TextField
        variant='outlined'
        placeholder='(A) Todo text +project @context due:2022-12-12 rec:d h:0 t:2022-12-12'
        label={label}
        inputRef={searchFieldRef}
        value={inputString}
        onChange={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <FontAwesomeIcon
                data-testid='fa-icon-search'
                icon={faSearch}
                className={focused ? 'Mui-focusVisible' : ''}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position='end'>
              {showAddTodoButton && (
                <Chip
                  label='Add as todo'
                  onClick={handleFilterSelect}
                />
              )}
              {inputString && (
              <button
                tabIndex={0}
                className='xClick'
                onClick={handleXClick}
              >
                <FontAwesomeIcon
                  data-testid='fa-icon-circle-xmark'
                  icon={faCircleXmark}
                />
              </button>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default Search;
