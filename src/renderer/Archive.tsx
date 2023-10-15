import React, { useState, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import Prompt from './Prompt';

const ipcRenderer = window.api.ipcRenderer;

interface ArchiveTodos {
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  t: any;
}

const Archive: React.FC<ArchiveTodos> = ({ setSnackBarContent, setSnackBarSeverity, t }) => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [promptIndex, setPromptIndex] = useState<number | null>(null);

  const handleArchiveTodos = (response: string | Error) => {
    if (typeof response === 'string') {
      setSnackBarSeverity('success');
      setSnackBarContent(response);
      setShowPrompt(false);
    } else if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
      setShowPrompt(true);
    } else {
      setShowPrompt(true);
    }
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
  };

  const handlePromptConfirm = () => {
    ipcRenderer.send('archiveTodos');
  };

  useEffect(() => {
    ipcRenderer.on('archiveTodos', handleArchiveTodos);
  }, []);

  return (
    <>
      <Prompt
        open={showPrompt}
        onClose={handlePromptClose}
        onConfirm={handlePromptConfirm}
        headline={t('prompt.archive.headline')}
        text={t('prompt.archive.text')}
        buttonText={t('prompt.archive.button')}
      />
    </>
  );
};

export default withTranslation()(Archive);