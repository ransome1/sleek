import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './ToolBar.scss';

const ToolBar = ({ 
  isSearchOpen,
  setIsSearchOpen,
  searchFieldRef
}) => {

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

  return (
    <Box id="ToolBar" onClick={handleClick}>
      <SearchIcon className={isSearchOpen ? 'active' : ''} />
    </Box>
  );
};

export default ToolBar;
