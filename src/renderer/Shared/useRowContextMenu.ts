import React from "react";
import { IpcRenderer } from "electron";

type ContextMenuItem = {
  id: string;
  label: string;
  function?: () => void;
  promptItem?: {
    id: string;
    headline: string;
    text: string;
    button1: string;
    onButton1: () => void;
  };
};

type ContextMenuProps = {
  event: React.MouseEvent;
  items: ContextMenuItem[];
};

type UseRowContextMenuProps = {
  setContextMenu: (menu: ContextMenuProps) => void;
  setPromptItem: (item: ContextMenuItem["promptItem"]) => void;
  t: (key: string) => string;
  ipcRenderer: IpcRenderer;
};

type UseRowContextMenuReturn = {
  handleRowContextMenu: (
    event: React.MouseEvent,
    todoString: string,
    lineNumber: number,
  ) => void;
};

export const useRowContextMenu = (
  props: UseRowContextMenuProps,
): UseRowContextMenuReturn => {
  const { setContextMenu, t, ipcRenderer } = props;

  const handleSaveToClipboard = (todoString: string) => {
    ipcRenderer.send("saveToClipboard", todoString);
  };

  const handleConfirmDelete = (lineNumber: number) => {
    ipcRenderer.send("removeLineFromFile", lineNumber);
  };

  const handleRowContextMenu = (
    event: React.MouseEvent,
    todoString: string,
    lineNumber: number,
  ): void => {
    // Check if the right-click target is an attribute button
    const target = event.target as HTMLElement;
    const isAttributeButton = target.closest(
      'button[data-testid^="datagrid-button-"]',
    );

    // If right-clicked on an attribute button, let the button's handler take precedence
    if (isAttributeButton) {
      return;
    }

    setContextMenu({
      event: event,
      items: [
        {
          id: "copy",
          label: t("copy"),
          function: () => handleSaveToClipboard(todoString),
        },
        {
          id: "delete",
          label: t("delete"),
          promptItem: {
            id: "delete",
            headline: t("prompt.delete.headline"),
            text: `${t("prompt.delete.text")}: <code>${todoString}</code>`,
            button1: t("delete"),
            onButton1: () => handleConfirmDelete(lineNumber),
          },
        },
      ],
    });
  };

  return { handleRowContextMenu };
};
