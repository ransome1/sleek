import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { ContextMenuItem, PromptItem } from '../main/util';

interface Props {
  contextMenuPosition: {
    top: number;
    left: number;
  } | null;
  setContextMenuPosition: (position: { top: number; left: number } | null) => void;
  contextMenuItems: ContextMenuItem[];
  setContextMenuItems: React.Dispatch<React.SetStateAction<ContextMenuItem[]>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<string>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>;
}

const { ipcRenderer } = window.api;

const ContextMenu: React.FC<Props> = ({
  contextMenuPosition,
  setContextMenuPosition,
  contextMenuItems,
  setContextMenuItems,
  setSnackBarSeverity,
  setSnackBarContent,
  setPromptItem,
}) => {
  const handleContextMenuClick = (item: ContextMenuItem) => {
    const { id, todoObject, index} = item;
    switch (id) {
      case 'delete':
        setPromptItem(item);
        break;
      case 'copy':
        setContextMenuItems(null);
        ipcRenderer.send('saveToClipboard', todoObject?.string);
        break;
      case 'removeFile':
        setPromptItem(item);
        break;
      case 'revealFile':
        setContextMenuItems(null);
        ipcRenderer.send('revealFile', index);
        break;
      default:
        setContextMenuItems(null);
    }
  };

  const handleChangeDoneFilePath = (index: number | undefined) => {
    ipcRenderer.send('changeDoneFilePath', index);
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
        onClose={() => setContextMenuItems(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuPosition || undefined}
      >
        {contextMenuItems && contextMenuItems.map((item) => (
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
    </>
  );
};

export default ContextMenu;
