import React, { useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import Prompt from './Prompt';
import { i18n } from './Settings/LanguageSelector';

const { ipcRenderer} = window.api;

interface Props extends WithTranslation {
  triggerArchiving: boolean;
  setTriggerArchiving: React.Dispatch<React.SetStateAction<boolean>>;
  settings: Settings,
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>;
  headers: HeadersObject;
  t: typeof i18n.t;
}

const Archive: React.FC<Props> = ({
    triggerArchiving,
    setTriggerArchiving,
    settings,
    setPromptItem,
    headers,
    t
}) => {

  const handleTriggerArchiving = (doneFileAvailable) => {
    setPromptItem((doneFileAvailable) ? promptItemArchiving : promptItemChooseChangeFile);
  };

  const handleArchiveConfirm = () => {
    ipcRenderer.send('archiveTodos');
  };

  const handleOpenDoneFile = () => {
    ipcRenderer.send('openFile', true);
  };

  const handleCreateDoneFile = () => {
    ipcRenderer.send('createFile', true);
  };

  const promptItemArchiving = {
    id: 'delete',
    headline: t('prompt.archive.headline'),
    text: t('prompt.archive.text'),
    button1: t('prompt.archive.button'),
    onButton1: handleArchiveConfirm,
  }

  const promptItemChooseChangeFile = {
    id: 'delete',
    headline: t('prompt.archive.changeFile.headline'),
    text: t('prompt.archive.changeFile.text'),
    button1: t('openFile'),
    onButton1: handleOpenDoneFile,
    button2: t('createFile'),
    onButton2: handleCreateDoneFile,
  }

  useEffect(() => {
    ipcRenderer.on('triggerArchiving', handleTriggerArchiving);
    return () => {
      ipcRenderer.off('triggerArchiving', handleTriggerArchiving);
    };
  }, []);

  return (<></>);
};

export default withTranslation()(Archive);
