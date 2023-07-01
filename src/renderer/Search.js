import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import TodoTxtDataGrid from './DataGrid';
import './Search.scss';

const Search = ({ todoTxtObjects }) => {
  const [searchString, setSearchString] = useState('');
  const [inputString, setInputString] = useState('');

  const handleChange = (event) => {
    setInputString(event.target.value.toLowerCase());
  };

  const handleSearch = () => {
    setSearchString(inputString);
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
        value={inputString}
        onChange={handleChange}
        placeholder="Search..."
      />
      <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} searchString={searchString} />
    </Box>
  );
};

export default Search;
