import React from 'react';
import { Button, Box } from '@mui/material';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import './SplashScreen.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const SplashScreen = ({ 
  screen,
  setSearchString,
  setDialogOpen
}) => {

  const handleCreateTodo = () => {
    setDialogOpen(true);
  };

  const handleReset = () => {
    store.setFilters([]);
    setSearchString('');
  };

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };

  const handleCreateFile = () => {
    ipcRenderer.send('createFile');
  };

  if(!screen) return null;

  return (
    <Box id='splashScreen'>
      {screen === 'noTodosVisible' && (
        <>
          <DryCleaningIcon />
          <p>No results visible.</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleReset}>
              Reset filters and search
            </Button>
          </Box>
        </>
      )}
      {screen === 'noTodosAvailable' && (
        <>
          <BeachAccessIcon />
          <p>Currently no todos in this file</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleCreateTodo}>
              Create a todo
            </Button>
          </Box>
        </>
      )}      
      {screen === 'noFiles' && (
        <Box className="fileDropZone">
          <SaveAltIcon />
          <p>Drop your todo.txt file here or use the buttons</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleOpenFile}>Open todo.txt file</Button>
            <Button variant='contained' onClick={handleCreateFile}>
              Create todo.txt file
            </Button>
          </Box>       
        </Box>
      )}
    </Box>
  );
};

export default SplashScreen;
