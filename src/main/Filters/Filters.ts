import { SettingsStore } from "../Stores";
import { DateTime } from "luxon";

function applyAttributes(todoObjects, filters) {
  return todoObjects.filter((todoObject) => {
    let match = true;
    for (const [key, filterList] of Object.entries(filters)) {
      for (const filter of filterList) {
        const values = filter.value;
        const exclude = filter.exclude;
        if (key in todoObject && todoObject[key] !== null) {
          if (exclude) {
            if (values.some((value) => todoObject[key].includes(value))) {
              match = false;
              break;
            }
          } else {
            if (!values.some((value) => todoObject[key].includes(value))) {
              match = false;
              break;
            }
          }
        } else if (!exclude) {
          match = false;
          break;
        }
      }
      if (!match) {
        break;
      }
    }
    return match;
  });
}

function handleCompletedTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  const showCompleted: boolean = SettingsStore.get("showCompleted");
  if (!showCompleted) {
    return todoObjects.filter((todoObject: TodoObject) => !todoObject.complete);
  } else {
    return todoObjects;
  }
}

function handleTodoObjectsDates(todoObjects: TodoObject[]): TodoObject[] {
  const thresholdDateInTheFuture: boolean = SettingsStore.get(
    "thresholdDateInTheFuture",
  );
  const dueDateInTheFuture: boolean = SettingsStore.get("dueDateInTheFuture");
  const now = DateTime.now();

  return todoObjects.filter((todoObject: TodoObject) => {
    const thresholdDate = todoObject?.t ? DateTime.fromISO(todoObject.t) : null;
    const dueDate = todoObject?.due ? DateTime.fromISO(todoObject.due) : null;

    return (
      !(thresholdDate && thresholdDate > now && !thresholdDateInTheFuture) &&
      !(dueDate && dueDate > now && !dueDateInTheFuture)
    );
  });
}

export { applyAttributes, handleCompletedTodoObjects, handleTodoObjectsDates };
