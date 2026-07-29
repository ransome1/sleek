import { expect, describe, it, vi } from "vitest";
import { sortTodoObjects, parseRecurrenceSortKey } from "./Sort";
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

describe("rec sorting", () => {
  // Helper: Create todo with specific rec value
  const createTodoWithRec = (
    rec: string | null,
  ): ReturnType<typeof createTodoObject> => {
    const todo = createTodoObject(1, "Test");
    todo.rec = rec;
    return todo;
  };

  describe("parseRecurrenceSortKey", () => {
    it("returns Infinity for null rec", () => {
      expect(parseRecurrenceSortKey(null)).toBe(Infinity);
    });

    it("returns Infinity for empty string", () => {
      expect(parseRecurrenceSortKey("")).toBe(Infinity);
    });

    it("handles bare interval (no count prefix)", () => {
      expect(parseRecurrenceSortKey("w")).toBe(7); // defaults to count=1
      expect(parseRecurrenceSortKey("d")).toBe(1);
      expect(parseRecurrenceSortKey("m")).toBe(30);
    });

    it("multiplies count by interval weight", () => {
      expect(parseRecurrenceSortKey("2w")).toBe(14); // 2 * 7
      expect(parseRecurrenceSortKey("3m")).toBe(90); // 3 * 30
    });

    it("applies strictness tie-breaker (+ prefix)", () => {
      expect(parseRecurrenceSortKey("1w")).toBe(7.0);
      expect(parseRecurrenceSortKey("+1w")).toBe(7.001); // relative sorts before strict
    });

    it("handles business days correctly (same weight as daily)", () => {
      expect(parseRecurrenceSortKey("1b")).toBe(1);
      expect(parseRecurrenceSortKey("2b")).toBe(2);
    });

    it("returns Infinity for invalid interval", () => {
      expect(parseRecurrenceSortKey("1x")).toBe(Infinity);
      expect(parseRecurrenceSortKey("3z")).toBe(Infinity);
    });

    it("returns Infinity for invalid count", () => {
      expect(parseRecurrenceSortKey("0w")).toBe(Infinity); // zero not allowed
      expect(parseRecurrenceSortKey("-1w")).toBe(Infinity); // negative not allowed
      expect(parseRecurrenceSortKey("+")).toBe(Infinity); // strictness only, no interval
    });

    it("handles large counts without precision loss", () => {
      expect(parseRecurrenceSortKey("999w")).toBe(6993); // 999 * 7
    });

    it("degrades gracefully for doubly-prefixed input", () => {
      // "++1w" is not valid rec: format, but parseInt("+1") = 1 and "w" is valid,
      // so it gracefully degrades to 1w. This is not a supported feature; it documents
      // that invalid inputs don't cause crashes.
      expect(parseRecurrenceSortKey("++1w")).toBe(7.001);
    });
  });

  describe("sortTodoObjects", () => {
    it("sorts by recurrence frequency (most frequent first)", () => {
      const daily = createTodoWithRec("1d");
      const weekly = createTodoWithRec("1w");
      const monthly = createTodoWithRec("1m");

      const todos = [monthly, daily, weekly];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [{ value: "rec", invert: false }]),
      );

      expect(todos).toEqual([daily, weekly, monthly]);
    });

    it("sorts within same interval by count", () => {
      const oneWeek = createTodoWithRec("1w");
      const twoWeeks = createTodoWithRec("2w");
      const threeWeeks = createTodoWithRec("3w");

      const todos = [threeWeeks, oneWeek, twoWeeks];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [{ value: "rec", invert: false }]),
      );

      expect(todos).toEqual([oneWeek, twoWeeks, threeWeeks]);
    });

    it("sorts relative before strict (same interval & count)", () => {
      const relative = createTodoWithRec("1w");
      const strict = createTodoWithRec("+1w");

      const todos = [strict, relative];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [{ value: "rec", invert: false }]),
      );

      expect(todos).toEqual([relative, strict]);
    });

    it("places null/invalid recs last in ascending sort", () => {
      const daily = createTodoWithRec("1d");
      const nullRec = createTodoWithRec(null);
      const invalidRec = createTodoWithRec("1x");

      const todos = [nullRec, daily, invalidRec];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [{ value: "rec", invert: false }]),
      );

      expect(todos[0]).toBe(daily);
      expect(
        todos.slice(1).every((t) => t.rec === null || t.rec === "1x"),
      ).toBe(true);
    });

    it("places null/invalid recs last in descending sort (inverted)", () => {
      const daily = createTodoWithRec("1d");
      const weekly = createTodoWithRec("1w");
      const nullRec = createTodoWithRec(null);

      const todos = [daily, nullRec, weekly];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [{ value: "rec", invert: true }]),
      );

      // Inverted: weekly (7) > daily (1), so weekly first
      expect(todos[0]).toBe(weekly);
      expect(todos[1]).toBe(daily);
      expect(todos[2]).toBe(nullRec); // null still last
    });

    it("chains with secondary sort attributes", () => {
      const daily1 = createTodoObject(1, "Task 1");
      daily1.rec = "1d";
      daily1.priority = "A";

      const daily2 = createTodoObject(1, "Task 2");
      daily2.rec = "1d";
      daily2.priority = "B";

      const todos = [daily2, daily1];
      todos.sort((a, b) =>
        sortTodoObjects(a, b, [
          { value: "rec", invert: false },
          { value: "priority", invert: false },
        ]),
      );

      // Both have rec=1d, so secondary sort by priority applies
      expect(todos[0].priority).toBe("A");
      expect(todos[1].priority).toBe("B");
    });
  });
});
