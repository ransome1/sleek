import { expect, describe, it } from "vitest";
import { sortTodoObjects } from "./Sort";
import { createTodoObject } from "./CreateTodoObjects";

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
