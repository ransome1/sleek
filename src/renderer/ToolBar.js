import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './ToolBar.scss';

const ToolBar = ({ isSearchOpen, setIsSearchOpen, headers }) => {

  const handleClick = (event) => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

  if (!headers || headers.availableObjects === 0) return null;

  return (
    <Box className="ToolBar">
      <FontAwesomeIcon
      	icon={faMagnifyingGlass}
      	onClick={handleClick}
      	className={isSearchOpen ? 'active' : ''}
      />
    </Box>
  );
};

export default ToolBar;
