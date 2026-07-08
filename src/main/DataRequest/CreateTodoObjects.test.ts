import { expect, describe, beforeEach, afterEach, it, vi } from "vitest";
import { createTodoObject } from "./CreateTodoObjects";

vi.mock("../Shared", () => ({
  lineBreakPlaceholder: "[LB]",
}));

vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((): undefined => undefined),
  },
}));

describe("createTodoObject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create a todo", () => {
    const todo = createTodoObject(
      1,
      "(B) Important Task +project @context due:2026-06-23 pm:4",
    );
    it("sets body", () => {
      expect(todo.body).toEqual(
        "Important Task +project @context due:2026-06-23 pm:4",
      );
    });
    it("sets due date", () => {
      expect(todo.due).toEqual("2026-06-23");
    });
    it("sets priority", () => {
      expect(todo.priority).toEqual("B");
    });
    it("sets project", () => {
      expect(todo.projects).toEqual(["project"]);
    });
    it("sets context", () => {
      expect(todo.contexts).toEqual(["context"]);
    });
    it("sets pomodoros", () => {
      expect(todo.pm).toEqual(4);
    });
    it("is not completed", () => {
      expect(todo.completed).toBeFalsy();
    });
    it("is not hidden", () => {
      expect(todo.hidden).toBeFalsy();
    });
  });

  describe("create hidden todo", () => {
    it("sets hidden to true", () => {
      const todo = createTodoObject(1, "I am hidden h:1");
      expect(todo.hidden).toBeTruthy();
    });
    it("sets hidden to false", () => {
      const todo = createTodoObject(1, "I am hidden h:0");
      expect(todo.hidden).toBeFalsy();
    });
  });

  describe("create todo with updates", () => {
    it("updates priority", () => {
      const todo = createTodoObject(1, "(B) todo", "priority", "A");
      expect(todo.priority).toEqual("A");
    });
    it("nulls priority if '-'", () => {
      const todo = createTodoObject(1, "(B) todo", "priority", "-");
      expect(todo.priority).toBeNull();
    });

    it("updates due date", () => {
      const todo = createTodoObject(
        1,
        "todo due:2026-06-23",
        "due",
        "2026-07-14",
      );
      expect(todo.due).toEqual("2026-07-14");
    });
    it("replaces speaking dates", () => {
      const todo = createTodoObject(1, "todo", "due", "tomorrow");
      expect(todo.due).toEqual("2026-05-11");
    });

    it("removes attribute", () => {
      const todo = createTodoObject(1, "todo t:2026-06-01", "t");
      expect(todo.t).toBeNull();
    });
  });

  describe("date handling", () => {
    it("parses completion/creation dates", () => {
      const todo = createTodoObject(1, "x 2026-05-10 2026-05-01 (A) todo");
      expect(todo.completed).toEqual("2026-05-10");
      expect(todo.created).toEqual("2026-05-01");
    });
  });

  describe("error correction", () => {
    it("trashes invalid due/t dates", () => {
      const todo = createTodoObject(1, "todo due:invalid t:invalid");
      expect(todo.due).toBeNull();
      expect(todo.t).toBeNull();
    });
    it("trashes invalid completion/creation dates", () => {
      const todo = createTodoObject(1, "x invalid invalid (A) todo");
      expect(todo.completed).toBeNull();
      expect(todo.created).toBeNull();
    });
    it("trashes invalid pomodoro value", () => {
      const todo = createTodoObject(1, "todo pm:invalid");
      expect(todo.pm).toBeNull();
    });
  });
});
