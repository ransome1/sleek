import React from 'react';
import { Button, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGhost, faHippo, faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import './SplashScreen.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const SplashScreen = ({ screen, setSearchString, setDialogOpen }) => {

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
          <FontAwesomeIcon icon={faHippo} />
          <p>No results found. Check your selected filters, filter settings or search input.</p>
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
        <Box className="fileDropZone">
          <FontAwesomeIcon icon={faFileArrowDown} />
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
