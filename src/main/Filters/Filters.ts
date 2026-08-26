import { Filters, TodoObject } from "@sleek-types";
import { SettingsStore, FiltersStore } from "../Stores";
import { DateTime } from "luxon";

function applyAttributes(todoObjects: TodoObject[], filters: Filters) {
  return todoObjects.filter((todoObject) => {
    let match = true;
    for (const [key, filterList] of Object.entries(filters)) {
      for (const filter of filterList) {
        const values = filter.value;
        const exclude = filter.exclude;
        if (key in todoObject && todoObject[key] !== null) {
          const todoValue = String(todoObject[key]);
          if (exclude) {
            if (values.some((value) => todoValue.includes(value))) {
              match = false;
              break;
            }
          } else {
            if (!values.some((value) => todoValue.includes(value))) {
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

export function applyHiddenCategories(todoObjects: TodoObject[]): TodoObject[] {
  const hiddenCategories =
    (FiltersStore.get("hiddenCategories") as string[] | undefined) ?? [];

  if (hiddenCategories.length === 0) return todoObjects;

  return todoObjects.filter((todoObject) => {
    for (const category of hiddenCategories) {
      const value = todoObject[category as keyof TodoObject];
      // Exclude todos that HAVE a value for this category
      // Arrays: exclude if non-empty; scalars: exclude if non-null/non-empty
      if (Array.isArray(value)) {
        if (value.length > 0) return false;
      } else if (value !== null && value !== undefined && value !== "") {
        return false;
      }
    }
    return true;
  });
}

export { applyAttributes, handleCompletedTodoObjects, handleTodoObjectsDates };
