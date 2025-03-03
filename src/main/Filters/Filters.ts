import { SettingsStore } from '../Stores'
import dayjs from 'dayjs'

function applyAttributes(todoObjects, filters) {
  return todoObjects.filter(todoObject => {
      let match = true;
      for (const [key, filterList] of Object.entries(filters)) {
          for (const filter of filterList) {
              const values = filter.value;
              const exclude = filter.exclude;
              if (key in todoObject && todoObject[key] !== null) {
                  if (exclude) {
                      if (values.some(value => todoObject[key].includes(value))) {
                          match = false;
                          break;
                      }
                  } else {
                      if (!values.some(value => todoObject[key].includes(value))) {
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
