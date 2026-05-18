import { arrayMove } from "@dnd-kit/sortable";
import { TodoData, TodoObject } from "../../@types";

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

function findItemLocation(data: TodoData, lineNumber: number) {
  for (let i = 0; i < data.length; i++) {
    const idx = data[i].todoObjects.findIndex((obj) => obj.lineNumber === lineNumber);
    if (idx !== -1) {
      return { groupIndex: i, itemIndex: idx, todoObject: data[i].todoObjects[idx] };
    }
  }
  return null;
}

function simulateHandleDragOver(prev: TodoData, activeId: number, overId: number, insertAfter = false): TodoData {
  const activeLoc = findItemLocation(prev, activeId);
  const overLoc = findItemLocation(prev, overId);
  if (!activeLoc || !overLoc) return prev;

  if (activeLoc.groupIndex === overLoc.groupIndex) {
    const group = prev[activeLoc.groupIndex];
    if (activeLoc.itemIndex === overLoc.itemIndex) return prev;
    const newTodoData = [...prev];
    newTodoData[activeLoc.groupIndex] = {
      ...group,
      todoObjects: arrayMove(group.todoObjects, activeLoc.itemIndex, overLoc.itemIndex),
    };
    return newTodoData;
  }

  const newData = prev.map((g) => ({ ...g, todoObjects: [...g.todoObjects] }));
  const [movedItem] = newData[activeLoc.groupIndex].todoObjects.splice(activeLoc.itemIndex, 1);
  let insertIndex = overLoc.itemIndex;
  if (insertAfter) insertIndex = overLoc.itemIndex + 1;
  newData[overLoc.groupIndex].todoObjects.splice(insertIndex, 0, movedItem);
  return newData;
}

function computeToLineNumberCrossGroup(data: TodoData, activeId: number): number {
  const activeLoc = findItemLocation(data, activeId)!;
  const targetGroup = data[activeLoc.groupIndex];

  if (targetGroup.todoObjects.length === 1) return activeId;
  if (activeLoc.itemIndex < targetGroup.todoObjects.length - 1) {
    const targetLine = targetGroup.todoObjects[activeLoc.itemIndex + 1].lineNumber;
    return targetLine > activeId ? targetLine - 1 : targetLine;
  }
  const beforeLine = targetGroup.todoObjects[activeLoc.itemIndex - 1].lineNumber;
  return beforeLine >= activeId ? beforeLine : beforeLine + 1;
}

function simulateReorderTodoLines(file: number[], from: number, to: number): number[] {
  const arr = file.slice();
  const [moved] = arr.splice(from, 1);
  arr.splice(to, 0, moved);
  return arr;
}

describe("Drag and drop state transitions", () => {
  it("same-group reorder: moving first item to last", () => {
    const group0 = {
      title: "A",
      visible: true,
      todoObjects: [createObj(1, "A"), createObj(3, "B"), createObj(5, "C")],
    };
    const data: TodoData = [group0];

    const afterDrag = simulateHandleDragOver(data, 1, 5);
    expect(afterDrag[0].todoObjects.map((o) => o.lineNumber)).toEqual([3, 5, 1]);
  });

  it("same-group reorder: moving last item to first", () => {
    const group0 = {
      title: "A",
      visible: true,
      todoObjects: [createObj(1, "A"), createObj(3, "B"), createObj(5, "C")],
    };
    const data: TodoData = [group0];

    const afterDrag = simulateHandleDragOver(data, 5, 1);
    expect(afterDrag[0].todoObjects.map((o) => o.lineNumber)).toEqual([5, 1, 3]);
  });

  it("cross-group move then reposition within target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      { title: "G1", visible: true, todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")] },
    ];

    let state = simulateHandleDragOver(data, 1, 3);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 1, 3, 4]);

    state = simulateHandleDragOver(state, 1, 4);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    state = simulateHandleDragOver(state, 1, 2);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 2, 3, 4]);

    const toLine = computeToLineNumberCrossGroup(state, 1);
    expect(toLine).toBe(1);

    const file = [0, 1, 2, 3, 4];
    const afterFile = simulateReorderTodoLines(file, 1, toLine);
    expect(afterFile).toEqual([0, 1, 2, 3, 4]);
  });

  it("cross-group drop at end of target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      { title: "G1", visible: true, todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")] },
    ];

    const state = simulateHandleDragOver(data, 1, 4, true);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    const toLine = computeToLineNumberCrossGroup(state, 1);
    expect(toLine).toBe(4);

    const file = [0, 1, 2, 3, 4];
    const afterFile = simulateReorderTodoLines(file, 1, toLine);
    expect(afterFile).toEqual([0, 2, 3, 4, 1]);
  });

  it("cross-group drop at start of target group", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(1, "A")] },
      { title: "G1", visible: true, todoObjects: [createObj(2, "B"), createObj(3, "C"), createObj(4, "D")] },
    ];

    const state = simulateHandleDragOver(data, 1, 2);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 2, 3, 4]);

    const toLine = computeToLineNumberCrossGroup(state, 1);
    expect(toLine).toBe(1);

    const file = [0, 1, 2, 3, 4];
    const afterFile = simulateReorderTodoLines(file, 1, toLine);
    expect(afterFile).toEqual([0, 1, 2, 3, 4]);
  });

  it("same-group toLineNumber with backend semantics", () => {
    const data: TodoData = [
      { title: "A", visible: true, todoObjects: [createObj(1, "A"), createObj(2, "B"), createObj(3, "C"), createObj(4, "D")] },
    ];

    const state = simulateHandleDragOver(data, 1, 4);
    expect(state[0].todoObjects.map((o) => o.lineNumber)).toEqual([2, 3, 4, 1]);

    const toLine = 4 > 1 ? 4 - 1 : 4;
    expect(toLine).toBe(3);

    const file = [0, 1, 2, 3, 4];
    const afterFile = simulateReorderTodoLines(file, 1, toLine);
    expect(afterFile).toEqual([0, 2, 3, 1, 4]);
  });

  it("cross-group with gaps in file line numbers", () => {
    const data: TodoData = [
      { title: "G0", visible: true, todoObjects: [createObj(0, "A")] },
      { title: "G1", visible: true, todoObjects: [createObj(1, "B"), createObj(4, "C"), createObj(6, "D")] },
    ];

    const state = simulateHandleDragOver(data, 0, 4);
    expect(state[1].todoObjects.map((o) => o.lineNumber)).toEqual([1, 0, 4, 6]);

    const toLine = computeToLineNumberCrossGroup(state, 0);
    expect(toLine).toBe(3);

    const file = [0, 1, 2, 3, 4, 5, 6];
    const afterFile = simulateReorderTodoLines(file, 0, toLine);
    expect(afterFile).toEqual([1, 2, 3, 0, 4, 5, 6]);
  });
});
