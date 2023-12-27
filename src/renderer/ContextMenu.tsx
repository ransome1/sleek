import React, { useState, useEffect, memo } from 'react';
import { Menu, MenuItem, Button, Tooltip } from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';

interface Props {
  contextMenuItems: ContextMenuItem[];
  setContextMenuItems: React.Dispatch<React.SetStateAction<ContextMenuItem[] | null>>;
  setPromptItem;
}

const { ipcRenderer } = window.api;

const ContextMenu: React.FC<Props> = memo(({
  contextMenuItems,
  setContextMenuItems,
  setPromptItem,
}) => {
  //const [contextMenuPosition, setContextMenuPosition] = useState(null);
  // const handleContextMenuClick = (item: ContextMenuItem) => {
  //   const { id, todoObject, pathToReveal} = item;
  //   switch (id) {
  //     case 'delete':
  //       setPromptItem(item);
  //       break;
  //     case 'copy':
  //       setContextMenuItems(null);
  //       ipcRenderer.send('saveToClipboard', todoObject?.string);
  //       break;
  //     case 'removeFile':
  //       setPromptItem(item);
  //       break;
  //     case 'revealInFileManager':
  //       setContextMenuItems(null);
  //       ipcRenderer.send('revealInFileManager', pathToReveal);
  //       break;
  //     default:
  //       setContextMenuItems(null);
  //   }
  // };

  // const handleChangeDoneFilePath = () => {
  //   setShowPromptDoneFile(true);
  // };

  const onClick = (contextMenuItem) => {
    if(contextMenuItem.promptItem) {
      setPromptItem(contextMenuItem.promptItem);
    } else if(contextMenuItem.function) {
      contextMenuItem.function();
      setContextMenuItems(null);
    }
  };

  return (
    <>
      <Menu
        open={Boolean(contextMenuItems)}
        onClose={() => setContextMenuItems(null)}
        anchorReference="anchorPosition"
        anchorPosition={{ top: contextMenuItems.event.clientY, left: contextMenuItems.event.clientX }}
      >
        {contextMenuItems && contextMenuItems.items.map((contextMenuItem) => (
          <MenuItem key={contextMenuItem.id} onClick={() => onClick(contextMenuItem)}>
            {contextMenuItem.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

export default ContextMenu;
