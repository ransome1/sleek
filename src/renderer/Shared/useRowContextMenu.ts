import React from "react";
import { IpcRenderer } from "electron";
import { AttributeKey, ContextMenuItem, PromptItem } from "@sleek-types";

type ContextMenuProps = {
  event: React.MouseEvent;
  items: ContextMenuItem[];
};

type UseRowContextMenuProps = {
  setContextMenu: (menu: ContextMenuProps) => void;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  t: (key: string) => string;
  ipcRenderer: IpcRenderer;
};

type UseRowContextMenuReturn = {
  handleRowContextMenu: (
    event: React.MouseEvent,
    todoString: string,
    lineNumber: number,
    attributeType?: AttributeKey,
  ) => void;
};

export const useRowContextMenu = (
  props: UseRowContextMenuProps,
): UseRowContextMenuReturn => {
  const { setContextMenu, t, ipcRenderer } = props;

  const handleSaveToClipboard = (todoString: string) => {
    ipcRenderer.send("saveToClipboard", todoString);
  };

  const handleArchive = (lineNumber: number) => {
    ipcRenderer.send("requestArchive", lineNumber);
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

    const items: ContextMenuItem[] = [
      {
        id: "copy",
        label: t("copy"),
        function: () => handleSaveToClipboard(todoString),
      },
      {
        id: "archive",
        label: t("archive"),
        function: () => handleArchive(lineNumber),
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
    ];

    setContextMenu({
      event: event,
      items: items,
    });
  };

  return { handleRowContextMenu };
};
