import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faFolderOpen, faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import Settings from './Settings';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;

const NavigationComponent = ({ isDrawerOpen, setIsDrawerOpen, drawerParameter, setDrawerParameter, setDialogOpen, files, headers }) => {
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
    <nav id='navigation'>
      <Box>sleek</Box>
      {files?.length > 0 && (
        <>
          <Button onClick={() => setDialogOpen(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </>
      )}

      {files?.length > 0 && headers?.availableObjects > 0 && (
        <>
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

      <Settings isOpen={isSettingsOpen} onClose={closeSettings} />
    </nav>
  );
};

export default NavigationComponent;