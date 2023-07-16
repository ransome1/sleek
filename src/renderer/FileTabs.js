import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './FileTabs.scss';

const ipcRenderer = window.electron.ipcRenderer;

const FileTabs = ({ files }) => {

  const activeIndex = files.findIndex((file) => file.active === true);

  useEffect(() => {
    const handleSetFileReply = (newIndex) => {
      ipcRenderer.send('updateConfig');
      ipcRenderer.send('requestData');
    };

    ipcRenderer.on('setFile', handleSetFileReply);

    return () => {
      ipcRenderer.removeAllListeners('setFile');
    };
  }, []);

  const handleChange = (event, index) => {
    ipcRenderer.send('setFile', [index, false]);
  };

  const handleRemove = (event, index) => {
    event.stopPropagation();
    ipcRenderer.send('setFile', [index, true]);
  };

  if (files && files.length <= 1) {
    return null;
  }

  return (
    <Tabs value={activeIndex} id="fileTabs" onChange={handleChange} data-testid="file-tabs-component">
      {files.map((file, index) => (
        file && (
          <Tab
            key={index}
            label={file.filename}
            icon={<FontAwesomeIcon icon={faCircleXmark} onClick={(event) => handleRemove(event, index)} />}
            className={file.active ? 'active-tab' : ''}
          />
        )
      ))}
    </Tabs>
  );
};

export default FileTabs;
