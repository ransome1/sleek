import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const { ipcRenderer } = window.api;

const NavigationComponent = ({
  setIsSettingsOpen,
  isDrawerOpen,
  setIsDrawerOpen,
  setDialogOpen,
  files,
  setIsNavigationOpen,
  colorTheme,
  showFileTabs,
  setAttributeMapping,
}) => {

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
            <Button onClick={() => setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)} className={isDrawerOpen ? 'active' : ''}>
              <FilterAltIcon />
            </Button>
          </>
        )} 
        <Button onClick={() => ipcRenderer.send('openFile')}>
          <FileOpenIcon />
        </Button>
        <Button className='break' onClick={() => setIsSettingsOpen(true)}>
          <SettingsIcon />
        </Button>
        <Button onClick={() => setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen)}>
          <KeyboardArrowLeftIcon />
        </Button>
      </Box>
      <Button onClick={() => setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen)} className="showNavigation">
        <KeyboardArrowRightIcon />
      </Button>
    </>
  );
};

export default NavigationComponent;