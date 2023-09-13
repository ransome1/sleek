import React from 'react';
import { Button, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGhost, faHippo, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import './SplashScreen.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const SplashScreen = ({ screen, setSearchString, setDialogOpen }) => {

  const handleOpenFile = () => {
    ipcRenderer.send('openFile');
  };

  const handleCreateFile = () => {
    ipcRenderer.send('createFile');
  };

  const handleCreateTodo = () => {
    setDialogOpen(true);
  };

  const handleReset = () => {
    store.setFilters([]);
    setSearchString('');
  };

  if(!screen) return null;

  return (
    <Box id='splashScreen'>
      {screen === 'noTodosVisible' && (
        <>
          <FontAwesomeIcon icon={faHippo} />
          <p>No results found for either your search input nor your selected filters</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleReset}>
              Reset filters and search
            </Button>
          </Box>
        </>
      )}
      {screen === 'noTodosAvailable' && (
        <>
          <FontAwesomeIcon icon={faGhost} />
          <p>Currently no todos in this file, let's create some</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleCreateTodo}>
              Create a todo
            </Button>
          </Box>
        </>
      )}      
      {screen === 'noFiles' && (
        <>
          <FontAwesomeIcon icon={faFolderOpen} />
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
