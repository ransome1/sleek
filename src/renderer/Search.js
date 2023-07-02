import React, { useState, useEffect } from 'react';
import { Button, Chip, Box, TextField, InputAdornment } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import TodoTxtDataGrid from './DataGrid';
import App from './App';
import './Search.scss';

const Search = ({ todoTxtObjects, handleSearchChange }) => {
  const [searchString, setSearchString] = useState('');
  const [inputString, setInputString] = useState('');

  const handleOnInput = (event) => {
    const searchString = event.target.value.toLowerCase();
    setInputString(searchString);
  };

  const handleSearch = () => {
    setSearchString(inputString);
    handleSearchChange(inputString);
  };

  const handleChipClick = () => {
    const searchField = document.getElementById("outlined-start-adornment");
    if(searchField.value != '') window.electron.ipcRenderer.send('writeTodoToFile', undefined, searchField.value);
  };

  const handleXClick = (event) => {
    const searchField = document.getElementById("outlined-start-adornment");
    searchField.value = "";
    setSearchString("");
  };

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      handleSearch();
    }, 250);

    return () => clearTimeout(delayTimer);
  }, [inputString]);

  return (
    <Box className="search">
      <TextField
        variant="outlined"
        id="outlined-start-adornment"
        placeholder="(A) Todo text +project @context due:2022-12-12 rec:d h:0 t:2022-12-12"
        onChange={handleOnInput}
        InputProps={{
          startAdornment: 
            <InputAdornment position="start">
              <FontAwesomeIcon data-testid='fa-icon-search' icon={faSearch} />
            </InputAdornment>,
          endAdornment:
            <InputAdornment position="end">
              <Chip label="Add as todo" onClick={handleChipClick} />
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