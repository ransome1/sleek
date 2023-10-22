import React, { useEffect, useCallback, RefObject } from 'react';
import { Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './ToolBar.scss';

interface Props {
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchFieldRef: RefObject<HTMLInputElement>;
}

const ToolBar: React.FC<Props> = ({
  isSearchOpen,
  setIsSearchOpen,
  searchFieldRef
}) => {
  const handleClick = () => {
    setIsSearchOpen((prevIsSearchOpen) => !prevIsSearchOpen);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isSearchFocused = document.activeElement === searchFieldRef.current;
      if ((event.metaKey || event.ctrlKey) && event.key === 'f' && isSearchOpen && !isSearchFocused) {
        event.preventDefault();
        searchFieldRef.current?.focus();
      }
    },
    [isSearchOpen, searchFieldRef]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box id='ToolBar' onClick={handleClick}>
      <SearchIcon className={isSearchOpen ? 'active' : ''} />
    </Box>
  );
};

export default ToolBar;
