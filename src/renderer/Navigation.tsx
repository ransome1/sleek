import React, { useEffect, memo } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, Box } from '@mui/material';
import { File, Headers } from '../main/util';
import './Navigation.scss';

const { ipcRenderer } = window.api;

interface Props {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  files: File[];
  setIsNavigationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTriggerArchiving: React.Dispatch<React.SetStateAction<boolean>>;
  headers: Headers;
}

const NavigationComponent: React.FC<Props> = memo(({
  setIsSettingsOpen,
  isDrawerOpen,
  setIsDrawerOpen,
  setDialogOpen,
  files,
  setIsNavigationOpen,
  setTriggerArchiving,
  headers,
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if(files.length > 0 && (event.metaKey || event.ctrlKey) && event.key === 'n') {
        setDialogOpen(true);
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
            <Button onClick={() => setDialogOpen(true)} data-testid='navigation-button-add-todo'>
              <AddIcon />
            </Button>
            <Button onClick={() => setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen)} className={isDrawerOpen ? 'active' : ''} data-testid='navigation-button-drawer'>
              <FilterAltIcon />
            </Button>
            {headers?.completedTodoObjects > 0 && (
              <>
                <Button onClick={() => setTriggerArchiving(true)} data-testid='navigation-button-archiving'>
                  <InventoryIcon />
                </Button>
              </>
            )}
          </>
        )}
        <Button onClick={() => ipcRenderer.send('openFile', false)} data-testid='navigation-button-open-file'>
          <FileOpenIcon />
        </Button>
        <Button className='break' onClick={() => setIsSettingsOpen(true)} data-testid='navigation-button-settings'>
          <SettingsIcon />
        </Button>
        <Button onClick={() => setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen)}>
          <KeyboardArrowLeftIcon />
        </Button>
      </Box>
      <Button onClick={() => setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen)} className='showNavigation' data-testid='navigation-button-hide-navigation'>
        <KeyboardArrowRightIcon />
      </Button>
    </>
  );
});

export default NavigationComponent;
