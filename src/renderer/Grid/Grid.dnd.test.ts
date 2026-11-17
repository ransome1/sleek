import { TodoData, TodoObject } from "../../@types";
import {
  applyDragOver,
  computeToLineNumber,
  findItemLocation,
  getAttributeChange,
} from "./dragAndDrop";

function createObj(lineNumber: number, string: string): TodoObject {
  return {
    lineNumber,
    string,
    body: string,
    complete: false,
    completed: null,
    priority: null,
    contexts: null,
    projects: null,
    due: null,
    dueString: null,
    notify: false,
    t: null,
    tString: null,
    rec: null,
    hidden: false,
    pm: null,
    created: null,
  };
}

function toLineAfterDrop(data: TodoData, activeId: number): number {
  const { groupIndex, itemIndex } = findItemLocation(data, activeId)!;
  return computeToLineNumber(data[groupIndex].todoObjects, itemIndex, activeId);
}

// Mirrors reorderTodoLines/moveTodoLine in the main process.
function reorderFile(file: number[], from: number, to: number): number[] {
  const arr = file.slice();
  const [moved] = arr.splice(from, 1);
  arr.splice(to, 0, moved);
  return arr;
}

describe("Drag and drop state transitions", () => {
  it("same-group reorder: moving first item to last", () => {
    const data: TodoData = [
      {
        title: "A",
        visible: true,
        todoObjects: [createObj(1, "A"), createObj(3, "B"), createObj(5, "C")],
      },
    ];

    const afterDrag = applyDragOver(data, 1, 5, false);
    expect(afterDrag[0].todoObjects.map((o) => o.lineNumber)).toEqual([
      3, 5, 1,
    ]);
  });

  it("same-group reorder: moving last item to first", () => {
    const data: TodoData = [
      {
        title: "A",
        visible: true,
        todoObjects: [createObj(1, "A"), createObj(3, "B"), createObj(5, "C")],
      },
    ];

    const afterDrag = applyDragOver(data, 5, 1, false);
    expect(afterDrag[0].todoObjects.map((o) => o.lineNumber)).toEqual([
      5, 1, 3,
    ]);
  });

  it("cross-group move then reposition within target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      {
        title: "G1",
        visible: true,
        todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")],
      },
    ];

    let state = applyDragOver(data, 1, 3, false);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 1, 3, 4]);

    state = applyDragOver(state, 1, 4, false);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    state = applyDragOver(state, 1, 2, false);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 2, 3, 4]);

    const toLine = toLineAfterDrop(state, 1);
    expect(toLine).toBe(1);
    expect(reorderFile([0, 1, 2, 3, 4], 1, toLine)).toEqual([0, 1, 2, 3, 4]);
  });

  it("cross-group drop at end of target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      {
        title: "G1",
        visible: true,
        todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")],
      },
    ];

    const state = applyDragOver(data, 1, 4, true);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    const toLine = toLineAfterDrop(state, 1);
    expect(toLine).toBe(4);
    expect(reorderFile([0, 1, 2, 3, 4], 1, toLine)).toEqual([0, 2, 3, 4, 1]);
  });

  it("cross-group drop at start of target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      {
        title: "G1",
        visible: true,
        todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")],
      },
    ];

    const state = applyDragOver(data, 1, 2, false);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 2, 3, 4]);

    const toLine = toLineAfterDrop(state, 1);
    expect(toLine).toBe(1);
    expect(reorderFile([0, 1, 2, 3, 4], 1, toLine)).toEqual([0, 1, 2, 3, 4]);
  });

  it("same-group drop to the end writes the file in the displayed order", () => {
    const data: TodoData = [
      {
        title: "A",
        visible: true,
        todoObjects: [
          createObj(1, "A"),
          createObj(2, "B"),
          createObj(3, "C"),
          createObj(4, "D"),
        ],
      },
    ];

    const state = applyDragOver(data, 1, 4, false);
    expect(state[0].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    const toLine = toLineAfterDrop(state, 1);
    expect(toLine).toBe(4);
    expect(reorderFile([0, 1, 2, 3, 4], 1, toLine)).toEqual([0, 2, 3, 4, 1]);
  });

  it("same-group drop to the top writes the file in the displayed order", () => {
    const data: TodoData = [
      {
        title: null,
        visible: true,
        todoObjects: [
          createObj(0, "A"),
          createObj(1, "B"),
          createObj(2, "C"),
          createObj(3, "D"),
        ],
      },
    ];

    const state = applyDragOver(data, 3, 0, false);
    expect(state[0].todoObjects.map((o) => o.lineNumber)).toEqual([3, 0, 1, 2]);

    const toLine = toLineAfterDrop(state, 3);
    expect(toLine).toBe(0);
    expect(reorderFile([0, 1, 2, 3], 3, toLine)).toEqual([3, 0, 1, 2]);
  });

  it("cross-group with gaps in file line numbers", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(0, "A")] },
      {
        title: "G1",
        visible: true,
        todoObjects: [createObj(1, "B"), createObj(4, "C"), createObj(6, "D")],
      },
    ];

    const state = applyDragOver(data, 0, 4, false);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 0, 4, 6]);

    const toLine = toLineAfterDrop(state, 0);
    expect(toLine).toBe(3);
    expect(reorderFile([0, 1, 2, 3, 4, 5, 6], 0, toLine)).toEqual([
      1, 2, 3, 0, 4, 5, 6,
    ]);
  });
});

describe("getAttributeChange", () => {
  const todo = { ...createObj(0, "A"), projects: ["home"], priority: "B" };

  it("adds all projects of the target group that the todo lacks", () => {
    expect(getAttributeChange(todo, ["home", "work"], "projects")).toEqual({
      type: "projects",
      value: ["work"],
    });
  });

  it("returns null for a group without projects", () => {
    expect(getAttributeChange(todo, null, "projects")).toBeNull();
  });

  it("returns null for sort keys a drop cannot set", () => {
    expect(getAttributeChange(todo, "2026-12-01", "t")).toBeNull();
  });

  it("sets or removes the priority", () => {
    expect(getAttributeChange(todo, "A", "priority")).toEqual({
      type: "priority",
      value: "A",
    });
    expect(getAttributeChange(todo, null, "priority")).toEqual({
      type: "priority",
      value: "-",
    });
    expect(getAttributeChange(todo, "B", "priority")).toBeNull();
  });
});
