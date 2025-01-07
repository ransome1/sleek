import React, { FC, memo } from 'react';
import Button from '@mui/material/Button';
import DryCleaningIcon from '@mui/icons-material/DryCleaning';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { withTranslation, WithTranslation } from 'react-i18next';
import { handleReset } from './Shared';
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

  const handleOpenFile = () => {
    ipcRenderer.send('openFile', false);
  };

  const handleCreateFile = () => {
    ipcRenderer.send('createFile', false);
  };

  return (
    <div id='splashScreen'>
      {settings.files?.length > 0 && headers?.availableObjects > 0 && headers?.visibleObjects === 0 && (
        <>
          <DryCleaningIcon />
          <p>{t('splashscreen.noTodosVisible.text')}</p>
          <div className="buttons">
            <Button variant='contained' onClick={handleReset} data-testid={`splashscreen-button-reset-filters`}>
              {t('splashscreen.noTodosVisible.reset')}
            </Button>
          </div>
        </>
      )}
      {settings.files?.length > 0 && headers?.availableObjects === 0 && (
        <>
          <BeachAccessIcon />
          <p>{t('splashscreen.noTodosAvailable.text')}</p>
          <div className="buttons">
            <Button variant='contained' onClick={handleCreateTodo} data-testid={`splashscreen-button-create-todo`}>
              {t('splashscreen.noTodosAvailable.create')}
            </Button>
          </div>
        </>
      )}
      {settings.files?.length === 0 && (
        <div className="fileDropZone">
          <SaveAltIcon />
          <p>{t('splashscreen.noFiles.text')}</p>
          <div className="buttons">
            <Button variant='contained' onClick={handleOpenFile}  data-testid={`splashscreen-button-open-file`}>
              {t('openFile')}
            </Button>
            <Button variant='contained' onClick={handleCreateFile} data-testid={`splashscreen-button-create-file`}>
              {t('createFile')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default withTranslation()(SplashScreen);
