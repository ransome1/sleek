import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './ToolBar.scss';

const ToolBar = ({ isSearchOpen, setIsSearchOpen, headers, searchFieldRef }) => {

  const handleClick = (event) => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {

      const isSearchFocused = document.activeElement === searchFieldRef.current;
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'f' && isSearchOpen && !isSearchFocused) {
        event.preventDefault();
        searchFieldRef.current.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);  

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
