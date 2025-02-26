import { SettingsStore } from '../Stores'
import dayjs from 'dayjs'

function applyAttributes(todoObjects: TodoObject[], filters: Filters | null): TodoObject[] {
  return todoObjects.filter((todoObject: TodoObject) => {
    return Object.entries(filters || {}).every(([key, filterArray]: [string, Filter[]]) => {
      if (filterArray.length === 0) {
        return true
      }

      const attributeValues: any = ['due', 't'].includes(key)
        ? todoObject[key as keyof TodoObject]
        : todoObject[key as keyof TodoObject]

      return filterArray.every(({ values, exclude }: Filter) => {
        if (
          attributeValues === undefined ||
          attributeValues === null ||
          (Array.isArray(attributeValues) && attributeValues.length === 0)
        ) {
          return exclude
        }

        const hasMatchingValue = Array.isArray(attributeValues)
          ? attributeValues.some((val) => values.includes(val))
          : Array.isArray(values) && values.includes(attributeValues)

        return exclude ? !hasMatchingValue : hasMatchingValue
      })
    })
  })
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
