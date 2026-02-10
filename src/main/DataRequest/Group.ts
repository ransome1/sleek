import { SettingsStore } from "../Stores";

const groupTodoObjects = (
  todoObjects: TodoObject[],
  attributeKey: string,
): TodoGroup => {
  const showHidden = SettingsStore.get("showHidden");
  const grouped: TodoGroup = {};

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
