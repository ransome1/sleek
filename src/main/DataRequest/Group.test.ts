import { expect, describe, it, vi } from "vitest";
import { TodoObject } from "@sleek-types";
import { createTodoObject } from "./CreateTodoObjects";
import { groupTodoObjects } from "./Group";

vi.mock("../Shared", () => ({
  lineBreakPlaceholder: "[LB]",
}));

let showHiddenSetting = false;
vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((key: string): boolean | undefined => {
      if (key === "showHidden") return showHiddenSetting;
      return undefined;
    }),
  },
}));

describe("groupTodoObjects", () => {
  beforeEach(() => {
    showHiddenSetting = false;
  });

  it("groups by priority", () => {
    const input: TodoObject[] = [
      createTodoObject(1, "Without Priority"),
      createTodoObject(1, "(A) Priority A"),
      createTodoObject(1, "(B) Priority B1"),
      createTodoObject(1, "(B) Priority B2"),
      createTodoObject(1, "(C) Priority C"),
    ];

    const r = groupTodoObjects(input, "priority");

    expect(r.length).toBe(4);

    expect(r[0].title).toBe(null);
    expect(r[0].todoObjects.length).toBe(1);
    expect(r[0].todoObjects[0].body).toBe("Without Priority");

    expect(r[1].title).toBe("A");
    expect(r[1].todoObjects.length).toBe(1);
    expect(r[1].todoObjects[0].body).toBe("Priority A");

    expect(r[2].title).toBe("B");
    expect(r[2].todoObjects.length).toBe(2);
    expect(r[2].todoObjects[0].body).toBe("Priority B1");
    expect(r[2].todoObjects[1].body).toBe("Priority B2");

    expect(r[3].title).toBe("C");
    expect(r[3].todoObjects.length).toBe(1);
    expect(r[3].todoObjects[0].body).toBe("Priority C");
  });

  it("groups by projects", () => {
    const input: TodoObject[] = [
      createTodoObject(1, "Without Project"),
      createTodoObject(1, "Project A +A"),
      createTodoObject(1, "Project B1 +B"),
      createTodoObject(1, "Project B2 +B"),
      createTodoObject(1, "Project AC +A +C"),
    ];

    const r = groupTodoObjects(input, "projects");

    expect(r.length).toBe(4);

    expect(r[0].title).toBe(null);
    expect(r[0].todoObjects.length).toBe(1);
    expect(r[0].todoObjects[0].body).toBe("Without Project");

    expect(r[1].title).toEqual(["A"]);
    expect(r[1].todoObjects.length).toBe(1);
    expect(r[1].todoObjects[0].body).toBe("Project A +A");

    expect(r[2].title).toEqual(["B"]);
    expect(r[2].todoObjects.length).toBe(2);
    expect(r[2].todoObjects[0].body).toBe("Project B1 +B");
    expect(r[2].todoObjects[1].body).toBe("Project B2 +B");

    expect(r[3].title).toEqual(["A", "C"]);
    expect(r[3].todoObjects.length).toBe(1);
    expect(r[3].todoObjects[0].body).toBe("Project AC +A +C");
  });

  it("hides group with hidden items (showHidden = false)", () => {
    const input: TodoObject[] = [
      createTodoObject(1, "visible"),
      createTodoObject(1, "(A) hidden h:1"),
    ];

    const r = groupTodoObjects(input, "priority");

    expect(r.length).toBe(2);
    expect(r[0].visible).toBeTruthy();
    expect(r[1].visible).toBeFalsy();
  });

  it("shows group with hidden items (showHidden = true)", () => {
    const input: TodoObject[] = [
      createTodoObject(1, "visible"),
      createTodoObject(1, "(A) hidden h:1"),
    ];

    showHiddenSetting = true;
    const r = groupTodoObjects(input, "priority");

    expect(r.length).toBe(2);
    expect(r[0].visible).toBeTruthy();
    expect(r[1].visible).toBeTruthy();
  });
});
