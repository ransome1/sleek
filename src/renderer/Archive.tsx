import React, { useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import Prompt from './Prompt';
import { i18n } from './LanguageSelector';
import { File } from '../main/util';

const { ipcRenderer, store } = window.api;

interface Props extends WithTranslation {
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  showPromptArchive: boolean;
  setShowPromptArchive: React.Dispatch<React.SetStateAction<boolean>>,
  showPromptDoneFile: boolean;
  setShowPromptDoneFile: React.Dispatch<React.SetStateAction<boolean>>,
  t: typeof i18n.t;
}

const Archive: React.FC<Props> = ({
    setSnackBarContent,
    setSnackBarSeverity,
    showPromptArchive,
    setShowPromptArchive,
    showPromptDoneFile,
    setShowPromptDoneFile,
    t
}) => {
  const handleArchiveTodos = (response: string | Error) => {
    setShowPromptDoneFile(false);
    if (typeof response === 'string') {
      setSnackBarSeverity('success');
      setSnackBarContent(response);
      setShowPromptArchive(false);
    } else if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
      setShowPromptArchive(true);
    } else {
      setShowPromptArchive(true);
    }
  };

  const handlePromptArchiveConfirm = () => {
    ipcRenderer.send('archiveTodos');
  };

  const handleOpenDoneFile = () => {
    ipcRenderer.send('openFile', true);
  };  

  const handleCreateDoneFile = () => {
    ipcRenderer.send('createFile', true);
  };

  useEffect(() => {
    const files: File[] = store.get('files');
    const index = files.findIndex((file) => file.active);

    if(showPromptArchive && !files[index].doneFilePath) {
      setShowPromptArchive(false);
      setShowPromptDoneFile(true);
    }
  }, [showPromptArchive]);  

  useEffect(() => {
    ipcRenderer.on('archiveTodos', handleArchiveTodos);
  }, []);

  return (
    <>
      <Prompt
        open={showPromptDoneFile}
        onClose={() => setShowPromptDoneFile(false)}
        headline={t('prompt.archive.changeFile.headline')}
        text={t('prompt.archive.changeFile.text')}
        button1={t('openFile')}
        onButton1={handleOpenDoneFile}
        button2={t('createFile')}
        onButton2={handleCreateDoneFile}
      />    
      <Prompt
        open={showPromptArchive}
        onClose={() => setShowPromptArchive(false)}
        headline={t('prompt.archive.headline')}
        text={t('prompt.archive.text')}
        confirmButton={t('prompt.archive.button')}
        onConfirm={handlePromptArchiveConfirm}
      />
    </>
  );
};

export default withTranslation()(Archive);
