import { ContextMenuItem, AttributeKey } from "@sleek-types";

export function createAttributeContextMenuItems(
  t: (key: string) => string,
  value: string,
  attributeKey: AttributeKey,
): ContextMenuItem[] {
  return [
    {
      id: 'rename',
      label: t("drawer.attributes.rename"),
      promptItem: {
        headline: t("drawer.attributes.renameValue"),
        text: t("drawer.attributes.renameDescription") + " <code>" + value + "</code>",
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
    },
    {
      id: 'delete',
      label: t("drawer.attributes.delete"),
      promptItem: {
        headline: t("drawer.attributes.deleteValue"),
        text: t("drawer.attributes.deleteDescription") + " <code>" + value + "</code>",
        button1: t("drawer.attributes.delete"),
        onButton1: () => {
          window.api.deleteFilterValue({
            attrType: attributeKey,
            valueToDelete: value,
          });
        },
      },
    },
  ];
}
