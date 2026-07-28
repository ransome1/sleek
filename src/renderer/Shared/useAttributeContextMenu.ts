import React from "react";
import { useTranslation } from "react-i18next";
import { ContextMenu, PromptItem, AttributeKey } from "@sleek-types";
import { createAttributeContextMenuItems } from "./AttributeContextMenu";

type UseAttributeContextMenuProps = {
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
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
  const { setContextMenu } = props;
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
    );
    setContextMenu({
      event,
      items,
    });
  };

  return { handleContextMenu };
};
