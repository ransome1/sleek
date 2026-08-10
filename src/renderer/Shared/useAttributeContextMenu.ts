import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ContextMenu,
  AttributeKey,
  SettingStore,
  SnackbarAction,
} from "@sleek-types";
import { createAttributeContextMenuItems } from "./AttributeContextMenu";

type UseAttributeContextMenuProps = {
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  settings: SettingStore | null;
  onNotification?: React.Dispatch<SnackbarAction>;
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
  const { setContextMenu, settings, onNotification } = props;
  const { t } = useTranslation();

  const handleContextMenu = useCallback(
    (
      event: React.MouseEvent,
      attributeValue: string,
      attributeType: AttributeKey,
    ): void => {
      const items = createAttributeContextMenuItems(
        t,
        attributeValue,
        attributeType,
        settings,
        onNotification,
      );
      setContextMenu({
        event,
        items,
      });
    },
    [t, setContextMenu, settings, onNotification],
  );

  return { handleContextMenu };
};
