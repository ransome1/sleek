import React, { memo, useRef, useEffect } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./ContextMenu.scss";
import { ContextMenu, ContextMenuItem, PromptItem } from "@sleek-types";

interface ContextMenuComponentProps {
  contextMenu: ContextMenu;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
}

const ContextMenuComponent: React.FC<ContextMenuComponentProps> = memo(
  ({ contextMenu, setContextMenu, setPromptItem }) => {
    const triggerElementRef = useRef<Element | null>(null);

    useEffect(() => {
      // Store the focused element before menu opens
      if (contextMenu) {
        triggerElementRef.current = document.activeElement;
      }
    }, [contextMenu]);

    const onClick = (contextMenuItem: ContextMenuItem): void => {
      if (contextMenuItem.promptItem) {
        setPromptItem(contextMenuItem.promptItem);
      } else if (contextMenuItem.function) {
        contextMenuItem.function();
      }
      handleClose();
    };

    const handleClose = (): void => {
      setContextMenu(null);
      // Restore focus to the element that triggered the menu
      setTimeout(() => {
        if (triggerElementRef.current instanceof HTMLElement) {
          triggerElementRef.current.focus();
        }
      }, 0);
    };

    return (
      <Menu
        id="contextMenu"
        open={Boolean(contextMenu)}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: contextMenu.event.clientY,
          left: contextMenu.event.clientX,
        }}
      >
        {contextMenu &&
          contextMenu.items.map((contextMenuItem: ContextMenuItem) => (
            <MenuItem
              key={contextMenuItem.id}
              data-testid={`contextMenu-item-${contextMenuItem.id}`}
              onClick={() => onClick(contextMenuItem)}
            >
              {contextMenuItem.label}
            </MenuItem>
          ))}
      </Menu>
    );
  },
);

ContextMenuComponent.displayName = "ContextMenuComponent";

export default ContextMenuComponent;
