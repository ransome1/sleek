import { fireEvent, render, screen } from "@testing-library/react";
import { HandleFilterSelect } from "../Shared";
import DrawerAttributes from "./Attributes";
import { Attributes, SettingStore } from "@sleek-types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../Shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../Shared")>();
  return {
    ...actual,
    HandleFilterSelect: vi.fn(),
    IsExcluded: vi.fn(() => false),
    IsSelected: vi.fn(() => false),
  };
});

vi.mock("../Shared/useAttributeContextMenu", () => ({
  useAttributeContextMenu: () => ({ handleContextMenu: vi.fn() }),
}));

describe("DrawerAttributes", () => {
  it("shows a context label while keeping its original value for filtering", () => {
    const rawValue = "[Support](https://example.com/support)";
    const settings = {
      showAttributesFromHiddenTodosInDrawer: false,
      useHumanFriendlyDates: false,
      accordionOpenState: [true],
    } as SettingStore;
    const attributes = {
      contexts: {
        [rawValue]: {
          count: 1,
          notify: false,
          hide: false,
          value: [rawValue],
        },
      },
    } as unknown as Attributes;

    render(
      <DrawerAttributes
        settings={settings}
        attributes={attributes}
        filters={{}}
        setContextMenu={vi.fn()}
        setPromptItem={vi.fn()}
        onNotification={vi.fn()}
      />,
    );

    const button = screen.getByTestId("drawer-button-contexts");
    expect(button).toHaveTextContent("Support");
    expect(button.closest("[data-todotxt-value]")).toHaveAttribute(
      "data-todotxt-value",
      rawValue,
    );

    fireEvent.click(button);
    expect(HandleFilterSelect).toHaveBeenCalledWith(
      "contexts",
      [rawValue],
      {},
      false,
      null,
    );
  });
});
