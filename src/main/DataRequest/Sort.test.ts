import { expect, describe, it } from "vitest";
import { sortTodoObjects, sortInProgressFirst } from "./Sort";
import { createTodoObject } from "./CreateTodoObjects";
import { TodoData } from "@sleek-types";

vi.mock("../Shared", () => ({
  lineBreakPlaceholder: "[LB]",
}));

vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((): undefined => undefined),
  },
}));

describe("sortTodoObjects", () => {
  it("returns 0 for equal values", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "(A) 1st Todo"),
        createTodoObject(1, "(A) 2nd Todo"),
        [{ value: "priority", invert: false }],
      ),
    ).toBe(0);
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo due:2026-01-01"),
        createTodoObject(1, "2nd Todo due:2026-01-01"),
        [{ value: "due", invert: false }],
      ),
    ).toBe(0);
  });

  it("returns -1 for greater values", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "(A) 1st Todo"),
        createTodoObject(1, "(B) 2nd Todo"),
        [{ value: "priority", invert: false }],
      ),
    ).toBe(-1);
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo due:2026-01-01"),
        createTodoObject(1, "2nd Todo due:2026-01-02"),
        [{ value: "due", invert: false }],
      ),
    ).toBe(-1);
  });

  it("returns 1 for lesser values", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "(B) 1st Todo"),
        createTodoObject(1, "(A) 2nd Todo"),
        [{ value: "priority", invert: false }],
      ),
    ).toBe(1);
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo due:2026-01-02"),
        createTodoObject(1, "2nd Todo due:2026-01-01"),
        [{ value: "due", invert: false }],
      ),
    ).toBe(1);
  });

  it("inverts comparison", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo due:2026-01-02"),
        createTodoObject(1, "2nd Todo due:2026-01-01"),
        [{ value: "due", invert: true }],
      ),
    ).toBe(-1);
  });

  it("handles null", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo due:2026-01-01"),
        createTodoObject(1, "2nd Todo"),
        [{ value: "due", invert: false }],
      ),
    ).toBe(-1);

    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo"),
        createTodoObject(1, "2nd Todo due:2026-01-01"),
        [{ value: "due", invert: false }],
      ),
    ).toBe(1);
  });

  it("handles numbers", () => {
    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo pm:1"),
        createTodoObject(1, "2nd Todo pm:2"),
        [{ value: "pm", invert: false }],
      ),
    ).toBe(-1);

    expect(
      sortTodoObjects(
        createTodoObject(1, "1st Todo pm:1"),
        createTodoObject(1, "2nd Todo pm:2"),
        [{ value: "pm", invert: true }],
      ),
    ).toBe(1);
  });
});

describe("sortInProgressFirst", () => {
  it("sorts inprogress items to the top of each group", () => {
    const todoData: TodoData = [
      {
        title: "A",
        visible: true,
        todoObjects: [
          createTodoObject(1, "Todo A"),
          createTodoObject(1, "Todo B inprogress:1"),
          createTodoObject(1, "Todo C"),
        ],
      },
    ];

    sortInProgressFirst(todoData);

    expect(todoData[0].todoObjects[0].inprogress).toBe(true);
    expect(todoData[0].todoObjects[1].inprogress).toBe(false);
    expect(todoData[0].todoObjects[2].inprogress).toBe(false);
  });

  it("sorts all inprogress items first across multiple groups", () => {
    const todoData: TodoData = [
      {
        title: "Group A",
        visible: true,
        todoObjects: [
          createTodoObject(1, "Todo 1"),
          createTodoObject(1, "Todo 2 inprogress:1"),
        ],
      },
      {
        title: "Group B",
        visible: true,
        todoObjects: [
          createTodoObject(1, "Todo 3 inprogress:1"),
          createTodoObject(1, "Todo 4"),
          createTodoObject(1, "Todo 5 inprogress:1"),
        ],
      },
    ];

    sortInProgressFirst(todoData);

    expect(todoData[0].todoObjects[0].inprogress).toBe(true);
    expect(todoData[0].todoObjects[1].inprogress).toBe(false);

    expect(todoData[1].todoObjects[0].inprogress).toBe(true);
    expect(todoData[1].todoObjects[1].inprogress).toBe(true);
    expect(todoData[1].todoObjects[2].inprogress).toBe(false);
  });

  it("preserves relative order of non-inprogress items", () => {
    const todoData: TodoData = [
      {
        title: null,
        visible: true,
        todoObjects: [
          createTodoObject(1, "Todo 1"),
          createTodoObject(1, "Todo 2"),
          createTodoObject(1, "Todo 3 inprogress:1"),
          createTodoObject(1, "Todo 4"),
        ],
      },
    ];

    sortInProgressFirst(todoData);

    expect(todoData[0].todoObjects[0].body).toBe("Todo 3 inprogress:1");
    expect(todoData[0].todoObjects[1].body).toBe("Todo 1");
    expect(todoData[0].todoObjects[2].body).toBe("Todo 2");
    expect(todoData[0].todoObjects[3].body).toBe("Todo 4");
  });
});
