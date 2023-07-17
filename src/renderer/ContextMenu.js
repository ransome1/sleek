import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import Prompt from './Prompt';

const ipcRenderer = window.electron.ipcRenderer;

const ContextMenu = ({ anchorPosition, index, setContextMenuPosition }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleMenuClick = (action) => {
    if (action === 'delete') {
      setShowPrompt(true);
    }
    handleCloseContextMenu();
  };

  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
  };

  const handlePromptConfirm = () => {
    setShowPrompt(false);
    ipcRenderer.send('writeTodoToFile', index, undefined, undefined, true);
  };    

  return (
    <>
      <Menu
        open={Boolean(anchorPosition)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
      >
        <MenuItem onClick={() => handleMenuClick('delete')}>Delete</MenuItem>
      </Menu>
      <Prompt
        open={showPrompt}
        onClose={handlePromptClose}
        onConfirm={handlePromptConfirm}
        headline="Delete todo?"
        text="The todo will be permanentaly removed from the file"
        buttonText="Delete"
      />      
    </>
  );
};

export default ContextMenu;
