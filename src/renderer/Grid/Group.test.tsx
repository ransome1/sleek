import { fireEvent, render, screen } from "@testing-library/react";
import { HandleFilterSelect } from "../Shared";
import Group from "./Group";

vi.mock("../Shared", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../Shared")>();
  return {
    ...actual,
    HandleFilterSelect: vi.fn(),
    IsSelected: vi.fn(() => false),
  };
});

vi.mock("../Shared/useAttributeContextMenu", () => ({
  useAttributeContextMenu: () => ({ handleContextMenu: vi.fn() }),
}));

describe("Group", () => {
  it("shows a project label while keeping its original value for filtering", () => {
    const rawValue = "[Roadmap](https://example.com/roadmap)";
    render(
      <Group
        attributeKey="projects"
        value={rawValue}
        filters={null}
        setContextMenu={vi.fn()}
        settings={null}
      />,
    );

    const button = screen.getByTestId("datagrid-group-button-projects");
    expect(button).toHaveTextContent("Roadmap");
    expect(button.closest("[data-todotxt-value]")).toHaveAttribute(
      "data-todotxt-value",
      rawValue,
    );

    fireEvent.click(button);
    expect(HandleFilterSelect).toHaveBeenCalledWith(
      "projects",
      [rawValue],
      null,
      false,
      null,
    );
  });
});
