import React, { useEffect, FC, memo } from 'react';
import { Button, Box } from '@mui/material';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { withTranslation, WithTranslation } from 'react-i18next';
import './SplashScreen.scss';
import { i18n } from './Settings/LanguageSelector';

interface Props extends WithTranslation {
  splashScreen: string | null;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSplashScreen: React.Dispatch<React.SetStateAction<string>>;
  setTodoObjects: React.Dispatch<React.SetStateAction<TodoObject[] | null>>;
  headers: HeadersObject;
  t: typeof i18n.t;
}

const { ipcRenderer, store } = window.api;

const SplashScreen: FC<Props> = memo(({
  splashScreen,
  setSearchString,
  setDialogOpen,
  setSplashScreen,
  setTodoObjects,
  headers,
  t,
}) => {
  const handleCreateTodo = () => {
    setDialogOpen(true);
  };

  const handleReset = () => {
    store.setFilters([]);
    setSearchString('');
  };

  const handleOpenFile = () => {
    ipcRenderer.send('openFile', false);
  };

  const handleCreateFile = () => {
    ipcRenderer.send('createFile', false);
  };

  useEffect(() => {

    if(!headers) {
      return;
    } else if(headers.availableObjects === 0) {      
      if(splashScreen !== 'noTodosAvailable') setSplashScreen('noTodosAvailable')
    } else if(headers.visibleObjects === 0) {
      if(splashScreen !== 'noTodosVisible') setSplashScreen('noTodosVisible');
    } else {
      setSplashScreen(null);
    }
  }, [headers]);

  return (
    <Box id='splashScreen'>
      {splashScreen === 'noTodosVisible' && (
        <>
          <DryCleaningIcon />
          <p>{t('splashscreen.noTodosVisible.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleReset}>
              {t('splashscreen.noTodosVisible.reset')}
            </Button>
          </Box>
        </>
      )}
      {splashScreen === 'noTodosAvailable' && (
        <>
          <BeachAccessIcon />
          <p>{t('splashscreen.noTodosAvailable.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleCreateTodo}>
              {t('splashscreen.noTodosAvailable.create')}
            </Button>
          </Box>
        </>
      )}
      {splashScreen === 'noFiles' && (
        <Box className="fileDropZone">
          <SaveAltIcon />
          <p>{t('splashscreen.noFiles.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleOpenFile}>
              {t('openFile')}
            </Button>
            <Button variant='contained' onClick={handleCreateFile}>
              {t('createFile')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default withTranslation()(SplashScreen);
