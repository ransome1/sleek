import React, { useEffect, memo } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Button from '@mui/material/Button';
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
    if(settings.files?.length > 0) {
      setTodoObject(null);
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if(event.ctrlKey && event.key === 'т') {
        handleOpen();
      }
    };

    ipcRenderer.on('isDialogOpen', handleOpen);
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      ipcRenderer.off('isDialogOpen', handleOpen);
      document.removeEventListener('keydown', handleKeyDown)
    };
  }, []);

  return (
    <>
      <div id='navigation'>
        <div>sleek</div>
        {settings.files?.length > 0 && (
          <>
            <Button onClick={() => handleOpen()} data-testid='navigation-button-add-todo'>
              <AddIcon />
            </Button>
            <Button onClick={() => store.set('isDrawerOpen', !settings.isDrawerOpen)} className={settings.isDrawerOpen ? 'active' : ''} data-testid='navigation-button-toggle-drawer'>
              <FilterAltIcon />
            </Button>
            {headers && headers.completedTodoObjects > 0 && (
              <>
                <Button onClick={() => ipcRenderer.send('requestArchive')} data-testid='navigation-button-archive-todos'>
                  <InventoryIcon />
                </Button>
              </>
            )}
          </>
        )}
        <Button onClick={() => ipcRenderer.send('openFile', false)} data-testid='navigation-button-open-file'>
          <FileOpenIcon />
        </Button>
        <Button className='break' onClick={() => setIsSettingsOpen(true)} data-testid='navigation-button-show-settings'>
          <SettingsIcon />
        </Button>
        <Button onClick={() => store.set('isNavigationOpen', false)} data-testid='navigation-button-hide-navigation'>
          <KeyboardArrowLeftIcon />
        </Button>
        <Button onClick={() => store.set('isNavigationOpen', true)} className='showNavigation' data-testid='navigation-button-show-navigation'>
        <KeyboardArrowRightIcon />
      </Button>
      </div>
      
    </>
  );
});

export default NavigationComponent;
