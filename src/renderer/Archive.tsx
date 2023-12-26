import React, { useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import Prompt from './Prompt';
import { i18n } from './Settings/LanguageSelector';

const { ipcRenderer} = window.api;

interface Props extends WithTranslation {
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  triggerArchiving: boolean;
  setTriggerArchiving: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings,
  showPromptDoneFile: boolean;
  setShowPromptDoneFile: React.Dispatch<React.SetStateAction<boolean>>;
  headers: HeadersObject;
  t: typeof i18n.t;
}

const Archive: React.FC<Props> = ({
    triggerArchiving,
    setTriggerArchiving,
    settings,
    showPromptDoneFile,
    setShowPromptDoneFile,
    headers,
    t
}) => {
  const [showPromptArchive, setShowPromptArchive] = useState<boolean>(false);

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
    if(triggerArchiving) {
      const index = settings.files.findIndex((file: FileObject) => file.active);
      const doneFilePath = settings.files[index]?.doneFilePath;

      if(doneFilePath && headers?.completedTodoObjects > 0) {
        setShowPromptDoneFile(false);
        setShowPromptArchive(true);
      } else if(!doneFilePath) {
        setShowPromptArchive(false);
        setShowPromptDoneFile(true);
      } else {
        setShowPromptArchive(false);
        setShowPromptDoneFile(false);
      }
      setTriggerArchiving(false);
    }
  }, [triggerArchiving]);

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
