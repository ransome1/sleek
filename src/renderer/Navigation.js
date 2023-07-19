import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faSlidersH, faFolderOpen, faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const NavigationComponent = ({ isDrawerOpen, setIsDrawerOpen, drawerParameter, setDrawerParameter, setDialogOpen, files, headers }) => {

  const [activeButtonClass, setActiveButtonClass] = useState(null);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleButtonClicked = (parameter) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)
    setDrawerParameter(parameter)
    setActiveButtonClass(parameter); // Set the active button class when a button is clicked
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      openAddTodoDialog();
    }
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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <nav id='navigation' data-testid='navigation-component'>
      <Box>sleek</Box>
      {files && files.length > 0 && (
        <>
          <Button onClick={openAddTodoDialog}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </>
      )}

      {files && files.length > 0 && headers.availableObjects > 0 && (
        <>
          <Button onClick={() => handleButtonClicked('filter')} className={isDrawerOpen && drawerParameter === 'filter' ? 'active' : ''}>
            <FontAwesomeIcon icon={faFilter} />
          </Button>
          <Button className={isDrawerOpen && drawerParameter === 'view' ? 'active' : ''}>
            <FontAwesomeIcon icon={faSlidersH} />
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
