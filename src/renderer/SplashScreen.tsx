import React, { useEffect, FC, memo } from 'react';
import { Button, Box } from '@mui/material';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { withTranslation, WithTranslation } from 'react-i18next';
import './SplashScreen.scss';
import { i18n } from './Settings/LanguageSelector';

interface SplashScreenProps extends WithTranslation {
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headers: HeadersObject | null;
  settings: Settings;
  t: typeof i18n.t;
}

const { ipcRenderer, store } = window.api;

const SplashScreen: FC<SplashScreenProps> = memo(({
  setSearchString,
  setDialogOpen,
  headers,
  settings,
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

  return (
    <Box id='splashScreen'>
      {settings.files?.length > 0 && headers?.visibleObjects === 0 && headers?.availableObjects > 0 && (
        <>
          <DryCleaningIcon />
          <p>{t('splashscreen.noTodosVisible.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleReset} data-testid={`splashcreen-button-reset-filters`}>
              {t('splashscreen.noTodosVisible.reset')}
            </Button>
          </Box>
        </>
      )}
      {settings.files?.length > 0 && headers?.availableObjects === 0 && (
        <>
          <BeachAccessIcon />
          <p>{t('splashscreen.noTodosAvailable.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleCreateTodo} data-testid={`splashcreen-button-create-todo`}>
              {t('splashscreen.noTodosAvailable.create')}
            </Button>
          </Box>
        </>
      )}
      {settings.files?.length === 0 && (
        <Box className="fileDropZone">
          <SaveAltIcon />
          <p>{t('splashscreen.noFiles.text')}</p>
          <Box className="buttons">
            <Button variant='contained' onClick={handleOpenFile}  data-testid={`splashcreen-button-open-file`}>
              {t('openFile')}
            </Button>
            <Button variant='contained' onClick={handleCreateFile} data-testid={`splashcreen-button-create-file`}>
              {t('createFile')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default withTranslation()(SplashScreen);
