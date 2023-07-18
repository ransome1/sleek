import React from 'react';
import { Button, Box } from '@mui/material';
import './SplashScreen.scss';

const ipcRenderer = window.electron.ipcRenderer;

const SplashScreen = ({ screen, setSearchString, setDialogOpen }) => {
  // if (!screen) {
  //   return null;
  // }

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };

  const handleCreateFile = () => {
    ipcRenderer.send('createFile');
  };

  const handleClearFiltersSearch = () => {
    ipcRenderer.send('selectedFilters', {});
    ipcRenderer.send('applySearchString', null);
    setSearchString('');
  };

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };  

  return (
    <Box id='splashScreen' data-testid='splashscreen-component'>
      {screen === 'noTodosVisible' && (
        <>
          <h1>No todos found</h1>
          <p>No results found for either your search input nor your selected filters</p>
          <Box className="buttons">
            <Button variant='contained' data-testid='navigation-button-files' onClick={handleClearFiltersSearch}>
              Reset filters and search
            </Button>
          </Box>
        </>
      )}
      {screen === 'noTodosAvailable' && (
        <>
          <h1>No todos available</h1>
          <p>Currently no todos in this file, let's create some</p>
          <Box className="buttons">
            <Button variant='contained' onClick={openAddTodoDialog}>
              Create a todo
            </Button>
          </Box>
        </>
      )}      
      {screen === 'noFiles' && (
        <>
          <h1>No files</h1>
          <p>No todo.txt files found, let's add one</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleOpenFile}>
              Open todo.txt file
            </Button>
            <Button variant='contained' onClick={handleCreateFile}>
              Create todo.txt file
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SplashScreen;
