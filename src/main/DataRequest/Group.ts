import { TodoData, TodoGroup, TodoObject } from "@sleek-types";
import { SettingsStore } from "../Stores";

const groupTodoObjects = (
  todoObjects: TodoObject[],
  attributeKey: string,
): TodoData => {
  const showHidden = SettingsStore.get("showHidden");
  // A Map keeps the sorted order; an object would move integer-like keys such as "1" to the front.
  const grouped = new Map<string, TodoGroup>();

  for (const todoObject of todoObjects) {
    const groupKey = todoObject[attributeKey] || null;
    let group = grouped.get(String(groupKey));
    if (!group) {
      group = { title: groupKey, todoObjects: [], visible: false };
      grouped.set(String(groupKey), group);
    }

    group.todoObjects.push(todoObject);

    if (!todoObject.hidden || (showHidden && todoObject.hidden)) {
      group.visible = true;
    }
  }

  return [...grouped.values()];
};

export { groupTodoObjects };
