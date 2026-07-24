import { useTranslation } from "react-i18next";
import { ContextMenuItem, AttributeKey, SettingStore } from "@sleek-types";

interface UseAttributeContextMenuProps {
  setContextMenu: React.Dispatch<React.SetStateAction<any | null>> | undefined;
  setPromptItem?: React.Dispatch<React.SetStateAction<any | null>>;
  settings?: SettingStore;
}

export function useAttributeContextMenu({ setContextMenu, setPromptItem, settings }: UseAttributeContextMenuProps) {
  const { t } = useTranslation();

  const handleContextMenu = (
    event: React.MouseEvent,
    value: string,
    attributeKey: AttributeKey,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!setContextMenu || !setPromptItem) return;

    // Date attributes that should be disabled when friendly dates are enabled
    const dateAttributes: AttributeKey[] = ['due', 't', 'created', 'completed'];
    const isDateAttribute = dateAttributes.includes(attributeKey);
    const isFriendlyDatesEnabled = settings?.useHumanFriendlyDates;
    const disableRename = isDateAttribute && isFriendlyDatesEnabled;

    const menuItems: ContextMenuItem[] = [];

    // Only add rename if not disabled
    if (!disableRename) {
      menuItems.push({
        id: 'rename',
        label: t("drawer.attributes.rename"),
        promptItem: {
          headline: t("drawer.attributes.renameValue"),
           text: t("drawer.attributes.renameDescription").replace(":", ": <code>" + value + "</code>."),
          button1: t("drawer.attributes.rename"),
          input: {
            label: t("drawer.attributes.newValue"),
            defaultValue: value.replace(/^[@+]/, ''),
            validate: (val: string) => {
              if (!val.trim()) return t("drawer.attributes.emptyError");
              if (/\s/.test(val)) return t("drawer.attributes.spacesError");
              if (val === value.replace(/^[@+]/, '')) return t("drawer.attributes.sameValueError");
              return true;
            },
          },
          onButton1: (inputValue?: string) => {
            if (inputValue) {
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

    // Only add delete if not disabled (same condition as rename for date attributes)
    if (!disableRename) {
      menuItems.push({
        id: 'delete',
        label: t("drawer.attributes.delete"),
        promptItem: {
          headline: t("drawer.attributes.deleteValue"),
           text: t("drawer.attributes.deleteDescription").replace(":", ": <code>" + value + "</code>."),
          button1: t("drawer.attributes.delete"),
          onButton1: () => {
            window.api.deleteFilterValue({
              attrType: attributeKey,
              valueToDelete: value,
            });
          },
        },
      });
    }

    // Only open context menu if there are items to show
    if (menuItems.length > 0) {
      setContextMenu({ event, items: menuItems });
    }
  };

  return { handleContextMenu };
}
