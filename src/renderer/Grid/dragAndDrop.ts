import { arrayMove } from "@dnd-kit/sortable";
import { TodoData, TodoGroup, TodoObject } from "../../@types";

export type AttributeChange =
  | { type: "priority" | "due"; value: string }
  | { type: "projects" | "contexts"; value: string[] };

// Returns the attribute a todo needs to belong to the group it was dropped into, or null when the drop cannot change its group.
// Projects and contexts are added, never replaced.
export const getAttributeChange = (
  todoObject: TodoObject,
  title: TodoGroup["title"],
  sortKey: string,
): AttributeChange | null => {
  if (sortKey === "priority" || sortKey === "due") {
    const value = typeof title === "string" ? title : null;
    if (todoObject[sortKey] === value) return null;
    return {
      type: sortKey,
      value: value ?? (sortKey === "priority" ? "-" : ""),
    };
  }
  if (
    (sortKey === "projects" || sortKey === "contexts") &&
    Array.isArray(title)
  ) {
    const missing = title.filter(
      (value) => !todoObject[sortKey]?.includes(value),
    );
    return missing.length > 0 ? { type: sortKey, value: missing } : null;
  }
  return null;
};

export const findItemLocation = (data: TodoData, lineNumber: number) => {
  for (let i = 0; i < data.length; i++) {
    const idx = data[i].todoObjects.findIndex(
      (obj) => obj.lineNumber === lineNumber,
    );
    if (idx !== -1) {
      return {
        groupIndex: i,
        itemIndex: idx,
        todoObject: data[i].todoObjects[idx],
      };
    }
  }
  return null;
};

// Moves the dragged todo to the hovered one's position; across groups it is inserted before it, or after it with insertAfter.
export const applyDragOver = (
  prev: TodoData,
  activeId: number,
  overId: number,
  insertAfter: boolean,
): TodoData => {
  const activeLoc = findItemLocation(prev, activeId);
  const overLoc = findItemLocation(prev, overId);
  if (!activeLoc || !overLoc) return prev;

  if (activeLoc.groupIndex === overLoc.groupIndex) {
    if (activeLoc.itemIndex === overLoc.itemIndex) return prev;
    const group = prev[activeLoc.groupIndex];
    const newTodoData = [...prev];
    newTodoData[activeLoc.groupIndex] = {
      ...group,
      todoObjects: arrayMove(
        group.todoObjects,
        activeLoc.itemIndex,
        overLoc.itemIndex,
      ),
    };
    return newTodoData;
  }

  const newTodoData = prev.map((g) => ({
    ...g,
    todoObjects: [...g.todoObjects],
  }));
  const [movedItem] = newTodoData[activeLoc.groupIndex].todoObjects.splice(
    activeLoc.itemIndex,
    1,
  );
  const insertIndex = insertAfter ? overLoc.itemIndex + 1 : overLoc.itemIndex;
  newTodoData[overLoc.groupIndex].todoObjects.splice(insertIndex, 0, movedItem);
  return newTodoData;
};

// Returns the target index for reorderTodoLines/moveTodoLine, which remove the line first and then insert it,
// so the dragged todo lands in the file right before its new successor in the group (or right after its predecessor when it is last).
export const computeToLineNumber = (
  todoObjects: TodoObject[],
  itemIndex: number,
  activeId: number,
): number => {
  if (todoObjects.length === 1) return activeId;
  if (itemIndex < todoObjects.length - 1) {
    const nextLine = todoObjects[itemIndex + 1].lineNumber;
    return nextLine > activeId ? nextLine - 1 : nextLine;
  }
  const previousLine = todoObjects[itemIndex - 1].lineNumber;
  return previousLine > activeId ? previousLine : previousLine + 1;
};
