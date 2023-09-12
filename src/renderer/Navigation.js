import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faFolderOpen, faCog, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import Settings from './Settings';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;

const NavigationComponent = ({ isDrawerOpen, setIsDrawerOpen, drawerParameter, setDrawerParameter, setDialogOpen, files, headers, isNavigationHidden, setIsNavigationHidden, colorTheme, setColorTheme, showFileTabs, setShowFileTabs }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleButtonClicked = (parameter) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)
    setDrawerParameter(parameter)
  };

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };

  const hideNavigation = () => {
    setIsNavigationHidden(prevIsNavigationHidden => !prevIsNavigationHidden);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (files?.length > 0 && (event.metaKey || event.ctrlKey) && event.key === 'n') {
        setDialogOpen(true);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        setIsDrawerOpen((prevIsDrawerOpen) => !prevIsDrawerOpen);
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
      <nav id='navigation'>
        <Box>sleek</Box>
        {files?.length > 0 && (
          <>
            <Button onClick={() => setDialogOpen(true)}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Button onClick={() => handleButtonClicked('filter')} className={isDrawerOpen ? 'active' : ''}>
              <FontAwesomeIcon icon={faFilter} />
            </Button>
          </>
        )} 
        <Button onClick={handleOpenFile}>
          <FontAwesomeIcon icon={faFolderOpen} />
        </Button>
        <Button className='break' onClick={openSettings}>
          <FontAwesomeIcon icon={faCog} />
        </Button>
        <Settings 
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          showFileTabs={showFileTabs}
          setShowFileTabs={setShowFileTabs}
          />
        <Button onClick={hideNavigation}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </Button>
      </nav>
      <Button onClick={hideNavigation} className="showNavigation">
        <FontAwesomeIcon icon={faAngleRight} />
      </Button>
    </>
  );
};

export default NavigationComponent;