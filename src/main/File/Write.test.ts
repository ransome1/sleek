import { expect, describe, it, vi, beforeEach } from "vitest";
import fs from "fs";
import { moveTodoLine } from "./Write";

const linesInFile = vi.hoisted(() => [] as string[]);

vi.mock("../DataRequest/CreateTodoObjects", () => ({
  linesInFile,
  createTodoObject: vi.fn(),
}));

vi.mock("fs", () => ({
  default: { writeFileSync: vi.fn() },
}));

vi.mock("./Active", () => ({
  getActiveFile: vi.fn(() => ({ todoFilePath: "/test/todo.txt" })),
}));

vi.mock("../Stores", () => ({
  SettingsStore: { get: vi.fn(() => false) },
}));

vi.mock("../Shared", () => ({ lineBreakPlaceholder: " [LB] " }));
vi.mock("../Date", () => ({}));

const writtenLines = (): string[] =>
  (vi.mocked(fs.writeFileSync).mock.calls.at(-1)![1] as string)
    .trimEnd()
    .split("\n");

describe("moveTodoLine", () => {
  beforeEach(() => {
    linesInFile.splice(
      0,
      linesInFile.length,
      "first +home @phone",
      "second +work due:2026-12-01",
    );
  });

  it("adds every project of the target group and keeps the todo's own", () => {
    moveTodoLine(0, 1, "projects", ["work", "garden"]);

    expect(writtenLines()).toEqual([
      "second +work due:2026-12-01",
      "first +home @phone +work +garden",
    ]);
  });

  it("inserts contexts before date extensions and skips ones already present", () => {
    moveTodoLine(1, 1, "contexts", ["phone", "office"]);

    expect(writtenLines()).toEqual([
      "first +home @phone",
      "second +work @phone @office due:2026-12-01",
    ]);
  });
});
