import React, { memo } from 'react';
import { Menu, MenuItem } from '@mui/material';

interface ContextMenuProps {
  contextMenu: ContextMenu;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
}

const ContextMenu: React.FC<ContextMenuProps> = memo(({
  contextMenu,
  setContextMenu,
  setPromptItem,
}) => {
  const onClick = (contextMenuItem: ContextMenuItem) => {
    if(contextMenuItem.promptItem) {
      setPromptItem(contextMenuItem.promptItem);
    } else if(contextMenuItem.function) {
      contextMenuItem.function();
      setContextMenu(null);
    }
  };

  return (
    <>
      <Menu
        id="contextMenu"
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={{ top: contextMenu.event.clientY, left: contextMenu.event.clientX }}
      >
        {contextMenu && contextMenu.items.map((contextMenuItem: ContextMenuItem) => (
          <MenuItem 
            key={contextMenuItem.id}
            data-testid={`contextMenu-item-${contextMenuItem.id}`}
            onClick={() => onClick(contextMenuItem)}
          >
            {contextMenuItem.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

export default ContextMenu;
