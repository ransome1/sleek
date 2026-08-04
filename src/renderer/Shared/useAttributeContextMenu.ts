import React from "react";
import { useTranslation } from "react-i18next";
import {
  ContextMenu,
  PromptItem,
  AttributeKey,
  SettingStore,
} from "@sleek-types";
import { createAttributeContextMenuItems } from "./AttributeContextMenu";

type UseAttributeContextMenuProps = {
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings?: SettingStore;
};

type UseAttributeContextMenuReturn = {
  handleContextMenu: (
    event: React.MouseEvent,
    attributeValue: string,
    attributeType: AttributeKey,
  ) => void;
};

export const useAttributeContextMenu = (
  props: UseAttributeContextMenuProps,
): UseAttributeContextMenuReturn => {
  const { setContextMenu, settings } = props;
  const { t } = useTranslation();

  const handleContextMenu = (
    event: React.MouseEvent,
    attributeValue: string,
    attributeType: AttributeKey,
  ): void => {
    const items = createAttributeContextMenuItems(
      t,
      attributeValue,
      attributeType,
      settings,
    );
    setContextMenu({
      event,
      items,
    });
  };

  return { handleContextMenu };
};
