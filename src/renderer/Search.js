import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, Button, Box } from '@mui/material';
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

const Search = ({ headers, searchString, setSearchString, isSearchOpen, setIsSearchOpen }) => {
  const searchFieldRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const label = headers?.availableObjects
    ? `Showing ${headers.visibleObjects} of ${headers.availableObjects}`
    : null;

  const handleInput = (event) => {
    const searchString = event.target.value;
    setSearchString(searchString);
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
    if (searchString === null) return;
    const handleSearch = () => {
      ipcRenderer.send('requestData', searchString);
    };
    const delayedSearch = debounce(handleSearch, 200);
    delayedSearch();
    return delayedSearch.cancel;
  }, [searchString]);

  useEffect(() => {
    if (isSearchOpen && searchFieldRef.current) {
      searchFieldRef.current.focus();
    }
  }, [isSearchOpen]);

  if (!headers || headers.availableObjects === 0) return null;

  return (
    <>
      {isSearchOpen && (
        <Box 
          id='search'
          className={isSearchOpen ? 'active' : ''}
        >
          <TextField
            variant='outlined'
            placeholder='Search'
            label={label}
            inputRef={searchFieldRef}
            value={searchString === null ? '' : searchString}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className={focused ? 'Mui-focusVisible' : ''}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  {searchString && searchString.length > 0 && (
                    <Button onClick={handleAddTodo}>Add as todo</Button>
                  )}
                  {searchString && searchString.length > 0 && (
                    <button
                      tabIndex={0}
                      className='xClick'
                      onClick={handleXClick}
                    >
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
    </>
  );
};

export default Search;
