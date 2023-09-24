import React, { useState, useEffect } from 'react';
import { Tab, Tabs } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import Prompt from './Prompt';
import './FileTabs.scss';

const ipcRenderer = window.electron.ipcRenderer;

const FileTabs = ({ 
  files,
  setContextMenuPosition,
  setContextMenuItems,  
}) => {

  const handleContextMenu = (event, index) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuItems([
      {
        id: 'changeDoneFilePath',
        label: 'Change location of done file',
        index: index,
        doneFilePath: files[index].doneFilePath,
      },
      {
        id: 'revealFile',
        label: 'Reveal in finder',
        index: index,
      },
      {
        id: 'removeFile',
        headline: 'Remove file from sleek?',
        text: 'It will not be deleted from your hard drive.',
        label: 'Remove',
        index: index,
      },
    ]);
  };  

  if (!files || Object.keys(files).length === 0) return null;
  
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

  useEffect(() => {
    setFileTab(index !== -1 ? index : 0);
  }, [index]);

  return (
    <>
      <Tabs value={fileTab} id="fileTabs" onChange={handleChange}>
        {files.map((file, index) => (
          file && (
            <Tab
              key={index}
              label={file.todoFileName}
              tabIndex={0}
              onContextMenu={() => handleContextMenu(event, index)}
              icon={
                <CancelIcon 
                  onClick={(event) => {
                    event.stopPropagation();
                    handleContextMenu(event, index);
                  }}
                />}
              className={file.active ? 'active-tab' : ''}
              value={index}
            />
          )
        ))}
      </Tabs>
    </>
  );
};

export default FileTabs;
