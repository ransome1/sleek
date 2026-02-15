import { TodoData, TodoGroups, TodoObject } from "@sleek-types";
import { SettingsStore } from "../Stores";

const groupTodoObjects = (
  todoObjects: TodoObject[],
  attributeKey: string,
): TodoData => {
  const showHidden = SettingsStore.get("showHidden");
  const grouped: TodoGroups = {};

  for (const todoObject of todoObjects) {
    const groupKey = todoObject[attributeKey] || null;
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        title: groupKey,
        todoObjects: [],
        visible: false,
      };
    }

    grouped[groupKey].todoObjects.push(todoObject);

    if (!todoObject.hidden || (showHidden && todoObject.hidden)) {
      grouped[groupKey].visible = true;
    }
  }

  return Object.values(grouped);
};

export { groupTodoObjects };
