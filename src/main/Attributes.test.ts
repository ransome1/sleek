import { describe, it, expect, beforeEach } from "vitest";
import { attributes, updateAttributes } from "./Attributes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sorting = [
  { value: "priority" },
  { value: "projects" },
  { value: "contexts" },
  { value: "due" },
  { value: "t" },
  { value: "rec" },
  { value: "pm" },
  { value: "created" },
  { value: "completed" },
];

/** Reset attributes to a clean state before each test. */
function reset() {
  updateAttributes([], sorting as any, true);
}

/** Build a minimal TodoObject with sensible defaults. */
function todo(overrides: Partial<Record<string, any>> = {}): any {
  return {
    priority: null,
    projects: [],
    contexts: [],
    due: null,
    t: null,
    rec: null,
    pm: null,
    created: null,
    completed: null,
    notify: false,
    hidden: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// count
// ---------------------------------------------------------------------------

describe("count", () => {
  beforeEach(reset);

  it("is 1 after one visible todo with that value", () => {
    updateAttributes([todo({ priority: "A" })], sorting as any, true);
    expect(attributes.priority["A"].count).toBe(1);
  });

  it("increments for each additional visible todo", () => {
    updateAttributes(
      [todo({ priority: "A" }), todo({ priority: "A" })],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].count).toBe(2);
  });

  it("is not incremented for a hidden todo", () => {
    updateAttributes(
      [todo({ priority: "A", hidden: true })],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].count).toBe(0);
  });

  it("counts only visible todos when mixed with hidden ones", () => {
    updateAttributes(
      [
        todo({ priority: "A" }), // visible
        todo({ priority: "A", hidden: true }), // hidden — must not count
      ],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].count).toBe(1);
  });

  it("counts multi-value attributes (projects) per element", () => {
    updateAttributes(
      [todo({ projects: ["work", "home"] })],
      sorting as any,
      true,
    );
    expect(attributes.projects["work"].count).toBe(1);
    expect(attributes.projects["home"].count).toBe(1);
  });

  it("skips null values", () => {
    updateAttributes([todo({ priority: null })], sorting as any, true);
    expect(attributes.priority["null"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// hide
// ---------------------------------------------------------------------------

describe("hide", () => {
  beforeEach(reset);

  it("is false when the todo is visible", () => {
    updateAttributes([todo({ priority: "A" })], sorting as any, true);
    expect(attributes.priority["A"].hide).toBe(false);
  });

  it("is true when all todos with that value are hidden", () => {
    updateAttributes(
      [todo({ priority: "A", hidden: true })],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].hide).toBe(true);
  });

  it("is false when at least one visible todo carries the value", () => {
    updateAttributes(
      [
        todo({ priority: "A", hidden: true }),
        todo({ priority: "A" }), // this one makes it visible
        todo({ priority: "A", hidden: true }),
      ],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].hide).toBe(false);
  });

  it("once false it stays false regardless of todo order", () => {
    updateAttributes(
      [
        todo({ priority: "A" }), // visible first
        todo({ priority: "A", hidden: true }),
      ],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].hide).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// notify
// ---------------------------------------------------------------------------

describe("notify", () => {
  beforeEach(reset);

  it("is true for a due attribute when the todo has notify set", () => {
    updateAttributes(
      [todo({ due: "2024-01-15", notify: true })],
      sorting as any,
      true,
    );
    expect(attributes.due["2024-01-15"].notify).toBe(true);
  });

  it("is false for non-due attributes even when the todo has notify set", () => {
    updateAttributes(
      [todo({ priority: "A", notify: true })],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].notify).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// alphabetical sort within a group
// ---------------------------------------------------------------------------

describe("alphabetical sort", () => {
  beforeEach(reset);

  it("sorts attribute values alphabetically within a group", () => {
    updateAttributes(
      [
        todo({ priority: "C" }),
        todo({ priority: "A" }),
        todo({ priority: "B" }),
      ],
      sorting as any,
      true,
    );
    expect(Object.keys(attributes.priority)).toEqual(["A", "B", "C"]);
  });
});

// ---------------------------------------------------------------------------
// two-pass behaviour
// ---------------------------------------------------------------------------

describe("two-pass behaviour", () => {
  beforeEach(reset);

  it("pass 2 zeroes counts and re-tallies from the filtered list", () => {
    // Pass 1: two todos
    updateAttributes(
      [todo({ priority: "A" }), todo({ priority: "A" })],
      sorting as any,
      true,
    );
    expect(attributes.priority["A"].count).toBe(2);

    // Pass 2: only one todo survives filtering
    updateAttributes([todo({ priority: "A" })], sorting as any, false);
    expect(attributes.priority["A"].count).toBe(1);
  });

  it("pass 2 preserves hide from pass 1 — zero-count entries remain visible", () => {
    // Pass 1: one visible todo and one hidden todo each with their own value
    updateAttributes(
      [
        todo({ priority: "A" }), // visible → hide = false
        todo({ priority: "B", hidden: true }), // hidden → hide = true
      ],
      sorting as any,
      true,
    );

    // Pass 2: filtered list is empty — neither value has a matching todo
    updateAttributes([], sorting as any, false);

    // "A" was visible in pass 1: must remain visible (hide = false) with count 0
    expect(attributes.priority["A"].count).toBe(0);
    expect(attributes.priority["A"].hide).toBe(false);

    // "B" was hidden in pass 1: must remain hidden (hide = true) with count 0
    expect(attributes.priority["B"].count).toBe(0);
    expect(attributes.priority["B"].hide).toBe(true);
  });

  it("pass 1 with reset = true wipes stale values from a previous run", () => {
    // First request: "A" exists
    updateAttributes([todo({ priority: "A" })], sorting as any, true);
    expect(attributes.priority["A"]).toBeDefined();

    // Second request, pass 1: "A" is gone from the file
    updateAttributes([todo({ priority: "B" })], sorting as any, true);
    expect(attributes.priority["A"]).toBeUndefined();
    expect(attributes.priority["B"]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// category sort order
// ---------------------------------------------------------------------------

describe("category sort order", () => {
  beforeEach(reset);

  it("reorders top-level categories to match the provided sort order", () => {
    const customSorting = [
      { value: "due" },
      { value: "priority" },
      { value: "projects" },
      { value: "contexts" },
      { value: "t" },
      { value: "rec" },
      { value: "pm" },
      { value: "created" },
      { value: "completed" },
    ];
    updateAttributes([], customSorting as any, true);
    expect(Object.keys(attributes)[0]).toBe("due");
    expect(Object.keys(attributes)[1]).toBe("priority");
  });
});
