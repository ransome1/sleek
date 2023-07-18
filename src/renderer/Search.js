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

const Search = ({ headers, searchString, setSearchString }) => {

  if(headers.availableObjects === 0) {
    return null;
  }

  const searchFieldRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const label = headers.availableObjects ? `Showing ${headers.visibleObjects} of ${headers.availableObjects}` : null;

  const handleInput = (event) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const handleSearch = () => {
    ipcRenderer.send('applySearchString', searchString)
  };

  const handleAddTodo = (event) => {
    ipcRenderer.send('writeTodoToFile', undefined, searchString);
    setSearchString('');
    searchFieldRef.current.focus();
  };

  const handleXClick = () => {
    setSearchString('');
    searchFieldRef.current.focus();
  };

  useEffect(() => {
    const delayedSearch = debounce(handleSearch, 200);
    delayedSearch();
    return delayedSearch.cancel;
  }, [searchString]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        if (searchFieldRef.current) {
          searchFieldRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Box id='search'>
      <TextField
        variant='outlined'
        placeholder='(A) Todo text +project @context due:2022-12-12 rec:d h:0 t:2022-12-12'
        label={label}
        inputRef={searchFieldRef}
        value={searchString}
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
              {searchString.length > 0 && (
                <Chip
                  label='Add as todo'
                  onClick={handleAddTodo}
                />
              )}
              {searchString.length > 0 && (
                <button
                  tabIndex={0}
                  className='xClick'
                  onClick={handleXClick}
                >
                  <FontAwesomeIcon data-testid='fa-icon-circle-xmark' icon={faCircleXmark}
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
