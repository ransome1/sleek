import { render } from "@testing-library/react";
import { RequestedData, TodoData, TodoObject } from "@sleek-types";
import IpcComponent from "./IpcRenderer";

const todo = (lineNumber: number, string: string): TodoObject =>
  ({ lineNumber, string }) as TodoObject;

describe("IpcComponent requestData", () => {
  it("applies regrouped data even when every todo keeps its line and text", () => {
    let todoData: TodoData | null = null;
    const setTodoData = vi.fn((update) => {
      todoData = typeof update === "function" ? update(todoData) : update;
    });

    render(
      <IpcComponent
        setHeaders={vi.fn()}
        setAttributes={vi.fn()}
        setFilters={vi.fn()}
        setTodoData={setTodoData}
        setTodoObject={vi.fn()}
        setAttributeFields={vi.fn()}
        onNotification={vi.fn()}
        setSettings={vi.fn()}
        setIsSettingsOpen={vi.fn()}
      />,
    );

    const onRequestData = vi
      .mocked(window.api.ipcRenderer.on)
      .mock.calls.find(([channel]) => channel === "requestData")![1] as (
      data: RequestedData,
    ) => void;

    const groupA = { title: "A", visible: true, todoObjects: [todo(0, "a")] };
    const groupB = { title: "B", visible: true, todoObjects: [todo(1, "b")] };

    onRequestData({ todoData: [groupA, groupB] } as RequestedData);
    onRequestData({ todoData: [groupB, groupA] } as RequestedData);

    expect(todoData).toEqual([groupB, groupA]);
  });
});
