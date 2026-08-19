import { ContextMenuItem, AttributeKey, SnackbarAction } from "@sleek-types";
import React from "react";
import { SettingStore } from "@sleek-types";

export function createAttributeContextMenuItems(
  t: (key: string) => string,
  value: string,
  attributeKey: AttributeKey,
  settings: SettingStore | null,
  onNotification?: React.Dispatch<SnackbarAction>,
): ContextMenuItem[] {
  // For contexts and projects, strip the @ or + prefix
  // For recurrence, keep the + as it's part of the value (e.g., +1d)
  const stripPrefixForTypes = ["contexts", "projects"];
  const displayValue = stripPrefixForTypes.includes(attributeKey)
    ? value.replace(/^[@+]/, "")
    : value;

  // Date and system-managed attributes should only show delete (no rename)
  // Recurrences support rename (they don't have fuzzy parsing issues)
  const disableRenameForAttributes = [
    ...(settings?.useHumanFriendlyDates ? ["due", "t"] : []),
  ];
  const shouldDisableRename =
    attributeKey && disableRenameForAttributes.includes(attributeKey);

  const items: ContextMenuItem[] = [];
  if (!shouldDisableRename) {
    items.push({
      id: "rename",
      label: t("drawer.attributes.rename.button"),
      promptItem: {
        headline: t("drawer.attributes.rename.headline"),
        text:
          t("drawer.attributes.rename.description") +
          " <code>" +
          value +
          "</code>",
        button1: t("drawer.attributes.rename.button"),
        input: {
          label: t("drawer.attributes.rename.newValue"),
          defaultValue: displayValue,
          validate: (val: string) => {
            if (!val.trim()) {
              return t("drawer.attributes.rename.emptyError");
            }
            if (/\s/.test(val)) {
              return t("drawer.attributes.rename.spacesError");
            }
            if (val === displayValue) {
              return t("drawer.attributes.rename.sameValueError");
            }
            return true;
          },
          onValidationError: (errorMessage: string) => {
            if (onNotification) {
              onNotification({
                type: "show",
                severity: "info",
                content: errorMessage,
              });
            }
          },
        },
        onButton1: (inputValue?: string) => {
          if (inputValue) {
            // Send the value as-is (backend now handles rec: prefix correctly)
            window.api.renameFilterValue({
              attrType: attributeKey,
              oldValue: value,
              newValue: inputValue,
            });
          }
        },
      },
    });
  }

  items.push({
    id: "delete",
    label: t("remove"),
    promptItem: {
      headline: t("drawer.attributes.remove.headline"),
      text:
        t("drawer.attributes.remove.description") +
        " <code>" +
        value +
        "</code>",
      button1: t("remove"),
      onButton1: () => {
        // Send value as-is, including + prefix for recurrence
        window.api.deleteFilterValue({
          attrType: attributeKey,
          valueToDelete: value,
        });
      },
    },
  });

  return items;
}
