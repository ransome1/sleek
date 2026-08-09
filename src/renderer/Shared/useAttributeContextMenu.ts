import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AlertColor } from "@mui/material/Alert";
import { ContextMenu, AttributeKey, SettingStore } from "@sleek-types";
import { createAttributeContextMenuItems } from "./AttributeContextMenu";

type UseAttributeContextMenuProps = {
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;

  settings: SettingStore | null;
  setSnackBarContent?: React.Dispatch<React.SetStateAction<string | null>>;
  setSnackBarSeverity?: React.Dispatch<
    React.SetStateAction<AlertColor | undefined>
  >;
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
  const { setContextMenu, settings, setSnackBarContent, setSnackBarSeverity } =
    props;
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
        setSnackBarContent,
        setSnackBarSeverity,
      );
      setContextMenu({
        event,
        items,
      });
    },
    [t, setContextMenu, settings, setSnackBarContent, setSnackBarSeverity],
  );

  return { handleContextMenu };
};
