import { expect, beforeEach, describe, it, vi } from "vitest";
import { DateTime } from "luxon";
import {
  createRecurringTodo,
  addRecurrenceToDate,
} from "./CreateRecurringTodo";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPrepareContentForWriting = vi.fn();
vi.mock("../File/Write", () => ({
  prepareContentForWriting: (...args: unknown[]) =>
    mockPrepareContentForWriting(...args),
}));

vi.mock("../Shared", () => ({
  lineBreakPlaceholder: "[LB]",
}));

let appendCreationDateSetting = false;
vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((key: string): boolean | undefined => {
      if (key === "appendCreationDate") return appendCreationDateSetting;
      return undefined;
    }),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the todo string that was passed to prepareContentForWriting. */
const capturedTodo = (): string => {
  expect(mockPrepareContentForWriting).toHaveBeenCalledOnce();
  return mockPrepareContentForWriting.mock.calls[0][1] as string;
};

/** Parse a `key:value` extension out of a todo string. */
const ext = (todo: string, key: string): string | undefined =>
  todo
    .split(" ")
    .find((t) => t.startsWith(`${key}:`))
    ?.slice(key.length + 1);

// ---------------------------------------------------------------------------
// addRecurrenceToDate
// ---------------------------------------------------------------------------

describe("addRecurrenceToDate", () => {
  const base = new Date("2021-06-01"); // Tuesday

  describe("each interval type advances the date correctly", () => {
    it("daily (d)", () => {
      expect(
        DateTime.fromJSDate(addRecurrenceToDate(base, "d", 1)).toISODate(),
      ).toBe("2021-06-02");
    });
    it("weekly (w)", () => {
      expect(
        DateTime.fromJSDate(addRecurrenceToDate(base, "w", 1)).toISODate(),
      ).toBe("2021-06-08");
    });
    it("monthly (m) — also verifies numeric prefix: rec:3m", () => {
      expect(
        DateTime.fromJSDate(addRecurrenceToDate(base, "m", 3)).toISODate(),
      ).toBe("2021-09-01");
    });
    it("annually (y)", () => {
      expect(
        DateTime.fromJSDate(addRecurrenceToDate(base, "y", 1)).toISODate(),
      ).toBe("2022-06-01");
    });
  });

  describe("business days (b)", () => {
    it("skips Saturday and Sunday — 4b from Tuesday → Monday", () => {
      // docs example: rec:4b completed 2021-06-01 → due:2021-06-07
      expect(
        DateTime.fromJSDate(addRecurrenceToDate(base, "b", 4)).toISODate(),
      ).toBe("2021-06-07");
    });

    it("1 business day from Friday → Monday", () => {
      expect(
        DateTime.fromJSDate(
          addRecurrenceToDate(new Date("2021-06-04"), "b", 1),
        ).toISODate(),
      ).toBe("2021-06-07");
    });

    it("1 business day starting on Saturday → Monday", () => {
      expect(
        DateTime.fromJSDate(
          addRecurrenceToDate(new Date("2021-06-05"), "b", 1),
        ).toISODate(),
      ).toBe("2021-06-07");
    });
  });

  describe("safe value fallback", () => {
    it("treats NaN value as 1", () => {
      const result = addRecurrenceToDate(base, "d", NaN);
      expect(DateTime.fromJSDate(result).toISODate()).toBe("2021-06-02");
    });

    it("treats 0 value as 1", () => {
      const result = addRecurrenceToDate(base, "d", 0);
      expect(DateTime.fromJSDate(result).toISODate()).toBe("2021-06-02");
    });
  });

  describe("unknown interval", () => {
    it("returns the original date unchanged", () => {
      const result = addRecurrenceToDate(base, "x", 1);
      expect(result).toEqual(base);
    });
  });
});

// ---------------------------------------------------------------------------
// createRecurringTodo
// ---------------------------------------------------------------------------

describe("createRecurringTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appendCreationDateSetting = false;
    // Pin "today" to 2021-06-01 (Tuesday) for all tests
    vi.setSystemTime(new Date("2021-06-01"));
  });

  // -------------------------------------------------------------------------
  // No recurrence / early exit
  // -------------------------------------------------------------------------

  describe("no recurrence", () => {
    it("does not call prepareContentForWriting when recurrence string is empty", () => {
      createRecurringTodo("Example todo", "");
      expect(mockPrepareContentForWriting).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Docs example: no due date, rec:w
  // "Example todo rec:w" completed on 2021-06-01 → due:2021-06-08
  // -------------------------------------------------------------------------

  describe("relative recurrence — no existing due date", () => {
    it("sets due date based on completion date when todo has no due date (docs example rec:w)", () => {
      createRecurringTodo("Example todo rec:w", "w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-08");
    });

    it("sets due date 1 month from completion date for rec:m", () => {
      createRecurringTodo("Example todo rec:m", "m");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-07-01");
    });

    it("sets due date 3 months from completion date for rec:3m", () => {
      createRecurringTodo("Example todo rec:3m", "3m");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-09-01");
    });

    it("sets due date 4 business days from completion (Tuesday → Monday) for rec:4b", () => {
      // docs example: rec:4b completed 2021-06-01 → due:2021-06-07
      createRecurringTodo("Example todo rec:4b", "4b");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-07");
    });

    it("sets due date 4 days from completion (Tuesday → Saturday) for rec:4d", () => {
      // docs example: rec:4d completed 2021-06-01 → due:2021-06-05
      createRecurringTodo("Example todo rec:4d", "4d");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-05");
    });
  });

  // -------------------------------------------------------------------------
  // Relative recurrence — existing due date (interval added to completion date)
  // -------------------------------------------------------------------------

  describe("relative recurrence — existing due date", () => {
    it("uses completion date, not old due date, when calculating new due date", () => {
      // Old due was 2021-05-15 (in the past); completion is 2021-06-01
      // New due = 2021-06-01 + 2m = 2021-08-01
      createRecurringTodo("Wash the windows due:2021-05-15 rec:2m", "2m");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-08-01");
    });

    it("docs example: late completion on 2021-06-25, rec:2m → new due 2021-08-25", () => {
      vi.setSystemTime(new Date("2021-06-25"));
      createRecurringTodo("Wash the windows due:2021-06-01 rec:2m", "2m");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-08-25");
    });
  });

  // -------------------------------------------------------------------------
  // Strict recurrence (+): interval added to previous due date
  // -------------------------------------------------------------------------

  describe("strict recurrence (+)", () => {
    it("adds interval to previous due date, not completion date (docs: pay the rent)", () => {
      // due:2021-05-15 rec:+1m, completed late on 2021-06-01 → new due 2021-06-15
      createRecurringTodo("pay the rent due:2021-05-15 rec:+1m", "+1m");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-15");
    });

    it("strict recurrence with no existing due date falls back to completion date + interval", () => {
      // docs: "If you specify a strict recurrence with the plus sign, but the todo has no due date,
      // the new duplicate todo will have a due date equal to the completion date plus the recurrence interval."
      createRecurringTodo("Example todo rec:+1w", "+1w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-08");
    });

    it("strict weekly: adds 1 week to previous due date", () => {
      createRecurringTodo("Stand-up meeting due:2021-05-25 rec:+1w", "+1w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-01");
    });
  });

  // -------------------------------------------------------------------------
  // Threshold date (t:)
  // -------------------------------------------------------------------------

  describe("threshold date", () => {
    it("updates threshold date preserving the gap between due and threshold", () => {
      // due:2021-06-08, t:2021-06-01 → gap = 7 days
      // completion date = 2021-06-01, rec:1w → new due = 2021-06-08
      // thresholdBase = newDueDate - 7 days = 2021-06-01
      // newThresholdDate = thresholdBase + 1w = 2021-06-08
      createRecurringTodo("Task due:2021-06-08 t:2021-06-01 rec:1w", "1w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-08");
      expect(ext(todo, "t")).toBe("2021-06-08");
    });

    it("updates threshold date using completion date when no due date (threshold only)", () => {
      // Only a threshold, no due date — should not set a due date
      createRecurringTodo("Task t:2021-05-25 rec:1w", "1w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBeUndefined();
      expect(ext(todo, "t")).toBe("2021-06-08");
    });

    it("strict recurrence updates threshold date relative to previous threshold", () => {
      // due:2021-06-08, t:2021-06-01, rec:+1w
      // new due = 2021-06-08 + 1w = 2021-06-15
      // new threshold = 2021-06-01 + 1w = 2021-06-08
      createRecurringTodo("Task due:2021-06-08 t:2021-06-01 rec:+1w", "+1w");
      const todo = capturedTodo();
      expect(ext(todo, "due")).toBe("2021-06-15");
      expect(ext(todo, "t")).toBe("2021-06-08");
    });
  });

  // -------------------------------------------------------------------------
  // Complete flag reset
  // -------------------------------------------------------------------------

  describe("complete flag reset", () => {
    it("clears the complete flag and completed date from the new recurring todo", () => {
      createRecurringTodo("x 2021-06-01 Example todo rec:w", "w");
      const todo = capturedTodo();
      expect(todo).not.toMatch(/^x \d{4}-\d{2}-\d{2}/);
    });
  });

  // -------------------------------------------------------------------------
  // Creation date
  // -------------------------------------------------------------------------

  describe("creation date", () => {
    it("does not append creation date when setting is off", () => {
      appendCreationDateSetting = false;
      createRecurringTodo("Example todo rec:w", "w");
      const todo = capturedTodo();
      // creation date would appear as the first token after priority, e.g. `2021-06-01 Example`
      expect(todo).not.toMatch(/^\d{4}-\d{2}-\d{2} /);
    });

    it("appends creation date when setting is on", () => {
      appendCreationDateSetting = true;
      createRecurringTodo("Example todo rec:w", "w");
      const todo = capturedTodo();
      expect(todo).toMatch(/^\d{4}-\d{2}-\d{2} /);
    });
  });

  // -------------------------------------------------------------------------
  // Line break normalisation
  // -------------------------------------------------------------------------

  describe("line break normalisation", () => {
    it("replaces CR/LF control characters with the line break placeholder", () => {
      createRecurringTodo("Line one\nLine two rec:w", "w");
      const todo = capturedTodo();
      expect(todo).toContain("[LB]");
      expect(todo).not.toContain("\n");
    });
  });

  // -------------------------------------------------------------------------
  // prepareContentForWriting call
  // -------------------------------------------------------------------------

  describe("prepareContentForWriting", () => {
    it("calls prepareContentForWriting with index -1 (append) and state false", () => {
      createRecurringTodo("Example todo rec:w", "w");
      expect(mockPrepareContentForWriting).toHaveBeenCalledWith(
        -1,
        expect.any(String),
        false,
      );
    });
  });
});
