import React, { useState, useEffect } from 'react';
import Prompt from './Prompt';

const ipcRenderer = window.electron.ipcRenderer;

const ArchiveTodos = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptIndex, setPromptIndex] = useState(null);

  const handleArchiveTodos = (activeFile) => {
    setShowPrompt(true);
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
  };

  const handlePromptConfirm = () => {
    setShowPrompt(false);
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
        headline="Archive completed todos?"
        text="This will move all completed todos to your specified done file"
        buttonText="Archive"
      />
    </>
  );
};

export default ArchiveTodos;
