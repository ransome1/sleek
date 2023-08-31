import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './ToolBar.scss';

const ToolBar = ({ isSearchOpen, setIsSearchOpen, headers, isSearchFocused, searchFieldRef }) => {

  const handleClick = (event) => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {      
      if ((event.metaKey || event.ctrlKey) && event.key === 'f' && !isSearchOpen) {
        event.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if((event.metaKey || event.ctrlKey) && event.key === 'f' && !isSearchFocused) {
        searchFieldRef.current.focus();
      } else if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
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
