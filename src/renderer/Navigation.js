import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, Box } from '@mui/material';
import Settings from './Settings';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;

const NavigationComponent = ({ isSettingsOpen, setIsSettingsOpen, isDrawerOpen, setIsDrawerOpen, setDialogOpen, files, headers, isNavigationOpen, setIsNavigationOpen, colorTheme, setColorTheme, showFileTabs, setShowFileTabs }) => {
  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleButtonClicked = (parameter) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)
  };

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };

  const toggleNavigation = () => {
    setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (files?.length > 0 && (event.metaKey || event.ctrlKey) && event.key === 'n') {
        setDialogOpen(true);
        return;
      }
    };    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [files]);

  return (
    <>
      <Box id='navigation'>
        <Box>sleek</Box>
        {files?.length > 0 && (
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <AddIcon />
            </Button>
            <Button onClick={() => handleButtonClicked('filter')} className={isDrawerOpen ? 'active' : ''}>
              <FilterAltIcon />
            </Button>
          </>
        )} 
        <Button onClick={handleOpenFile}>
          <FileOpenIcon />
        </Button>
        <Button className='break' onClick={openSettings}>
          <SettingsIcon />
        </Button>
        <Settings 
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          showFileTabs={showFileTabs}
          setShowFileTabs={setShowFileTabs}
          />
        <Button onClick={toggleNavigation}>
          <KeyboardArrowLeftIcon />
        </Button>
      </Box>
      <Button onClick={toggleNavigation} className="showNavigation">
        <KeyboardArrowRightIcon />
      </Button>
    </>
  );
};

export default NavigationComponent;