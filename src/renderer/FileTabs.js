import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Prompt from './Prompt';
import './FileTabs.scss';

const ipcRenderer = window.electron.ipcRenderer;

const FileTabs = ({ files }) => {

  if (!files || Object.keys(files).length === 0) return null;
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptIndex, setPromptIndex] = useState(null);
  const index = files.findIndex((file) => file.active);
  const [fileTab, setFileTab] = useState(index !== -1 ? index : 0);

  const handleChange = (event, index) => {
    if(index < 0 || index > 9) return false;
    setFileTab(index);
    ipcRenderer.send('setFile', index);
  };

  const handleRemove = (event, index) => {
    event.stopPropagation();
    setPromptIndex(index);
    setShowPrompt(true);
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
  };

  const handlePromptConfirm = () => {
    setShowPrompt(false);
    ipcRenderer.send('removeFile', promptIndex);
  };

  useEffect(() => {
    setFileTab(index !== -1 ? index : 0);
  }, [index]);

  return (
    <>
      <Tabs value={fileTab} id="fileTabs" onChange={handleChange} data-testid="file-tabs-component">
        {files.map((file, index) => (
          file && (
            <Tab
              key={index}
              label={file.filename}
              tabIndex={0}
              icon={<FontAwesomeIcon icon={faCircleXmark} onClick={(event) => handleRemove(event, index)} />}
              className={file.active ? 'active-tab' : ''}
              value={index}
            />
          )
        ))}
      </Tabs>
      <Prompt
        open={showPrompt}
        onClose={handlePromptClose}
        onConfirm={handlePromptConfirm}
        headline="Remove file from sleek?"
        text="It will not be deleted from your hard drive."
        buttonText="Remove"
      />
    </>
  );
};

export default FileTabs;
