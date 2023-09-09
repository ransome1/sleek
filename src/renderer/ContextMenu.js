import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import Prompt from './Prompt';

const ipcRenderer = window.electron.ipcRenderer;

const ContextMenu = ({ anchorPosition, items, onClose, index }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptItem, setPromptItem] = useState(null);

  const handleMenuClick = (item) => {
    if (item.id === 'delete') {
      setShowPrompt(true);
      setPromptItem(item);
    }
    onClose();
  };

  const handleCloseContextMenu = () => {
    onClose();
  };

  const handlePromptClose = () => {
    setShowPrompt(false);
    setPromptItem(null);
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
        {items.map((item) => (
          <MenuItem key={item.id} onClick={() => handleMenuClick(item)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      {promptItem && (
        <Prompt
          open={showPrompt}
          onClose={handlePromptClose}
          onConfirm={handlePromptConfirm}
          headline={promptItem.headline}
          text={promptItem.text}
          buttonText={promptItem.label}
        />
      )}
    </>
  );
};

export default ContextMenu;
