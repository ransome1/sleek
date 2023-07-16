import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faSlidersH, faFolderOpen, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const ipcRenderer = window.electron.ipcRenderer;

const NavigationComponent = ({ toggleDrawer, isDrawerOpen, setDialogOpen, files }) => {

  const [activeButton, setActiveButton] = useState(null);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleButtonClicked = (parameter) => {
    toggleDrawer(parameter);
    setActiveButton(parameter);
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
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);  

  return (
    <nav id='navigation' data-testid='navigation-component'>
      <Box>sleek</Box>
      {files !== undefined && (
        <>
          <Button onClick={openAddTodoDialog} className={activeButton === 'add' ? 'active' : ''}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        
          <Button onClick={() => handleButtonClicked('filter')} className={isDrawerOpen && activeButton === 'filter' ? 'active' : ''}>
            <FontAwesomeIcon icon={faFilter} />
          </Button>
        

          <Button className={isDrawerOpen && activeButton === 'view' ? 'active' : ''}>
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
      <Button>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </Button>
    </nav>
  );
};

export default NavigationComponent;
