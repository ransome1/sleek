import { SettingsStore } from '../Stores'
import dayjs from 'dayjs'

function hasMatchingFilters(todoObject, filters) {
  return Object.keys(filters).every(key => {
    const filterValuesSet = new Set(filters[key].map(filter => filter.value).flat());
    if (Array.isArray(todoObject[key])) {
      return todoObject[key].some(value => filterValuesSet.has(value));
    } else if (typeof todoObject[key] === 'string') {
      return filterValuesSet.has(todoObject[key]);
    }
    return false;
  });
}

function applyAttributes(todoObjects, filters) {
  return todoObjects.filter(todoObject => hasMatchingFilters(todoObject, filters));
}

function handleCompletedTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  const showCompleted: boolean = SettingsStore.get('showCompleted')
  if (!showCompleted) {
    return todoObjects.filter((todoObject: TodoObject) => !todoObject.complete)
  } else {
    return todoObjects
  }
}

function handleTodoObjectsDates(todoObjects: TodoObject[]): TodoObject[] {
  const thresholdDateInTheFuture: boolean = SettingsStore.get('thresholdDateInTheFuture')
  const dueDateInTheFuture: boolean = SettingsStore.get('dueDateInTheFuture')

  return todoObjects.filter((todoObject: TodoObject) => {
    const thresholdDate = dayjs(todoObject?.t)
    const dueDate = dayjs(todoObject?.due)

    return (
      !(thresholdDate && thresholdDate.isAfter(dayjs()) && !thresholdDateInTheFuture) &&
      !(dueDate && dueDate.isAfter(dayjs()) && !dueDateInTheFuture)
    )
  })
}

export { applyAttributes, handleCompletedTodoObjects, handleTodoObjectsDates }
