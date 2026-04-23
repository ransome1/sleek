import { expect, describe, beforeEach, it, vi } from "vitest";
import { changeCompleteState } from "./ChangeCompleteState";
import { createRecurringTodo } from "./CreateRecurringTodo";

vi.mock("../Shared", () => ({
  lineBreakPlaceholder: "[LB]",
}));

vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((): undefined => undefined),
  },
}));

vi.mock("./CreateRecurringTodo");

describe("changeCompleteState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("change to completed", () => {
    it("adds x to front", () => {
      const r = changeCompleteState("My simple todo", true);
      expect(r).toMatch(/^x .+ My simple todo/);
    });
    it("adds completion date", () => {
      const r = changeCompleteState("2026-01-01 My simple todo", true);
      expect(r).toMatch(/^x \d{4}-\d{2}-\d{2} 2026-01-01/);
    });
    it("adds creation date if nonexistent", () => {
      const r = changeCompleteState("My simple todo", true);
      expect(r).toMatch(/^x \d{4}-\d{2}-\d{2} \d{4}-\d{2}-\d{2}/);
    });
    it("moves priority to pri attribute", () => {
      const r = changeCompleteState("(B) My simple todo", true);
      expect(r).toMatch(/^x .+ pri:B/);
    });
    it("calls createRecurringTodo if recurring", () => {
      const todo = "My recurring todo rec:1b";
      changeCompleteState(todo, true);
      expect(createRecurringTodo).toHaveBeenCalledWith(todo, "1b");
    });
  });

  describe("change to uncompleted", () => {
    it("removes x", () => {
      const r = changeCompleteState("x My simple todo", false);
      expect(r).toMatch(/^My simple todo$/);
    });
    it("keeps creation date", () => {
      const r = changeCompleteState("x 2026-01-01 My simple todo", false);
      expect(r).toMatch(/^2026-01-01 My simple todo$/);
    });
    it("removes completion date", () => {
      const r = changeCompleteState(
        "x 2026-10-10 2026-01-01 My simple todo",
        false,
      );
      expect(r).toMatch(/^2026-01-01 My simple todo$/);
    });
    it("restores priority", () => {
      const r = changeCompleteState("x My simple todo pri:B", false);
      expect(r).toMatch(/^\(B\) My simple todo$/);
    });
  });
});
