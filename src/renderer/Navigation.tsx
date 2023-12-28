import React, { useEffect, memo } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const { ipcRenderer, store } = window.api;

interface Props {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings;
  headers: HeadersObject | null;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
}

const NavigationComponent: React.FC<Props> = memo(({
  setIsSettingsOpen,
  setDialogOpen,
  settings,
  headers,
  setTodoObject,
}) => {

  const handleOpen = () => {
    setTodoObject(null);
    setDialogOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if(settings.files?.length > 0 && (event.metaKey || event.ctrlKey) && event.key === 'n') {
        handleOpen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.files]);

  return (
    <>
      <Box id='navigation'>
        <Box>sleek</Box>
        {settings.files?.length > 0 && (
          <>
            <Button onClick={() => handleOpen()} data-testid='navigation-button-add-todo'>
              <AddIcon />
            </Button>
            <Button onClick={() => store.set('isDrawerOpen', !settings.isDrawerOpen)} className={settings.isDrawerOpen ? 'active' : ''} data-testid='navigation-button-drawer'>
              <FilterAltIcon />
            </Button>
            {headers && headers.completedTodoObjects > 0 && (
              <>
                <Button onClick={() => ipcRenderer.send('requestArchive')} data-testid='navigation-button-archiving'>
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
        <Button onClick={() => store.set('isNavigationOpen', false)}>
          <KeyboardArrowLeftIcon />
        </Button>
      </Box>
      <Button onClick={() => store.set('isNavigationOpen', true)} className='showNavigation' data-testid='navigation-button-hide-navigation'>
        <KeyboardArrowRightIcon />
      </Button>
    </>
  );
});

export default NavigationComponent;
