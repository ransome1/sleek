import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faFolderOpen, faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;

const NavigationComponent = ({ isDrawerOpen, setIsDrawerOpen, drawerParameter, setDrawerParameter, setDialogOpen, files, headers }) => {

  const [activeButtonClass, setActiveButtonClass] = useState(null);

  const handleButtonClicked = (parameter) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)
    setDrawerParameter(parameter)
    setActiveButtonClass(parameter);
  };

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };
  
  useEffect(() => {
    if (!isDrawerOpen) {
      setActiveButtonClass(null);
    }
  }, [isDrawerOpen]);  

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
    <nav id='navigation' data-testid='navigation-component'>
      <Box>sleek</Box>
      {files && files.length > 0 && (
        <>
          <Button onClick={() => setDialogOpen(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </>
      )}

      {files?.length > 0 && headers?.availableObjects > 0 && (
        <>
          <Button onClick={() => handleButtonClicked('filter')} className={isDrawerOpen && drawerParameter === 'filter' ? 'active' : ''}>
            <FontAwesomeIcon icon={faFilter} />
          </Button>
        </>
      )} 

      <Button onClick={handleOpenFile}>
        <FontAwesomeIcon icon={faFolderOpen} />
      </Button>

      <Button className='break'>
        <FontAwesomeIcon icon={faCog} />
      </Button>
    </nav>
  );
};

export default NavigationComponent;