import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import Prompt from './Prompt';

interface ContextMenuItem {
  id: string;
  label: string;
  todoObject?: {
    id: string;
    string: string;
  };
  index?: number;
  doneFilePath?: string;
  headline?: string;
  text?: string;
}

interface ContextMenu {
  contextMenuPosition: {
    top: number;
    left: number;
  } | null;
  setContextMenuPosition: (position: { top: number; left: number } | null) => void;
  contextMenuItems: ContextMenuItem[];
  setContextMenuItems: React.Dispatch<React.SetStateAction<ContextMenuItem[]>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
}

const ipcRenderer = window.api.ipcRenderer;

const ContextMenu: React.FC<ContextMenu> = ({
  contextMenuPosition,
  setContextMenuPosition,
  contextMenuItems,
  setContextMenuItems,
  setSnackBarSeverity,
  setSnackBarContent,
}) => {
  const [promptItem, setPromptItem] = useState<ContextMenuItem | null>(null);

  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
    setContextMenuItems([]);
  };

  const handlePromptClose = () => {
    setPromptItem(null);
    handleCloseContextMenu();
  };  

  const handleContextMenuClick = (item: ContextMenuItem) => {
    const { id, todoObject, index, doneFilePath } = item;

    switch (id) {
      case 'delete':
        setPromptItem(item);
        break;
      case 'copy':
        handleCloseContextMenu();
        ipcRenderer.send('saveToClipboard', todoObject?.string);
        break;
      case 'removeFile':
        setPromptItem(item);
        break;
      case 'revealFile':
        handleCloseContextMenu();
        ipcRenderer.send('revealFile', index);
        break;
      default:
        handleCloseContextMenu();
    }
  };

  const handlePromptConfirm = (item: ContextMenuItem) => {
    const { id, todoObject, index } = item;

    switch (id) {
      case 'delete':
        ipcRenderer.send('removeLineFromFile', todoObject?.id);
        break;
      case 'removeFile':
        ipcRenderer.send('removeFile', index);
        break;
      default:
        handleCloseContextMenu();
    }
  };

  const handleChangeDoneFilePath = (index: number | undefined) => {
    if (index !== '') {
      ipcRenderer.send('changeDoneFilePath', index);
    }
  };

  const handleSaveToClipboard = function (response: Error | string) {
    const severity = response instanceof Error ? 'error' : 'success';
    setSnackBarSeverity(severity);
    setSnackBarContent(response instanceof Error ? response.message : response);
  };

  useEffect(() => {
    const saveToClipboardListener = (response: Error | string) => {
      handleSaveToClipboard(response);
    };
    ipcRenderer.on('saveToClipboard', saveToClipboardListener);
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
              <Tooltip placement='right' arrow title={item.doneFilePath || ''}>
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
          headline={promptItem.headline || ''}
          text={promptItem.text || ''}
          buttonText={promptItem.label}
        />
      )}
    </>
  );
};

export default ContextMenu;
