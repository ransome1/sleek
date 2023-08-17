import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './ToolBar.scss';

const ToolBar = ({ isSearchOpen, setIsSearchOpen }) => {

  const handleClick = (event) => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

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
