import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import Prompt from './Prompt';

const ipcRenderer = window.electron.ipcRenderer;

const ContextMenu = ({
  contextMenuPosition,
  setContextMenuPosition,
  contextMenuItems,
  setContextMenuItems,
  setSnackBarSeverity,
  setSnackBarContent
}) => {
  const [promptItem, setPromptItem] = useState(null);

  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
    setContextMenuItems([]);
  };

  const handleContextMenuClick = (item) => {
    if (item.id === 'delete') {
      setPromptItem(item);
    } else if (item.id === 'copy') {
      ipcRenderer.send('saveToClipboard', item.todoObject.string);
    } else if (item.id === 'removeFile') {
      setPromptItem(item);
    } else if (item.id === 'revealFile') {
      ipcRenderer.send('revealFile', item.index);
    }
    handleCloseContextMenu();
  };

  const handlePromptConfirm = (item) => {
    if (item.id === 'delete') {
      ipcRenderer.send('writeTodoToFile', item.todoObject.id, undefined, undefined, true);
    } else if (item.id === 'removeFile') {
      ipcRenderer.send('removeFile', item.index);
    }
  };

  const handlePromptClose = () => {
    setPromptItem(null);
    handleCloseContextMenu();
  };

  const handleChangeDoneFilePath = (index) => {
    ipcRenderer.send('changeDoneFilePath', index);
  };  

  const handleSaveToClipboard = function(response) {
    if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
    } else {
      setSnackBarSeverity('success');
      setSnackBarContent(response);
    }
  }

  useEffect(() => {
    ipcRenderer.on('saveToClipboard', handleSaveToClipboard);
  }, []);  

  return (
    <>
      <Menu
        open={Boolean(contextMenuPosition)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuPosition}
      >
        {contextMenuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleContextMenuClick(item)}>
            {item.id === 'changeDoneFilePath' ? (
              <Tooltip title={item.doneFilePath}>
                <Button onClick={() => handleChangeDoneFilePath(item.index)} startIcon={<FileOpenIcon />}>
                  {item.label}
                </Button>
              </Tooltip>
            ) : (
              item.label
            )}
          </MenuItem>
        ))}
      </Menu>
      {promptItem && (
        <Prompt
          open={true}
          onClose={handlePromptClose}
          onConfirm={() => handlePromptConfirm(promptItem)}
          headline={promptItem.headline}
          text={promptItem.text}
          buttonText={promptItem.label}
        />
      )}
    </>
  );
};

export default ContextMenu;
