import { config } from '../../config'

function sortAndGroupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): TodoGroup {
  const fileSorting: boolean = config.get('fileSorting')
  const showHidden: boolean = config.get('showHidden')
  const sortCompletedLast: boolean = config.get('sortCompletedLast')

  function sortTodoObjects(a: TodoObject, b: TodoObject, sorting: Sorting[]): number {
    const compareValues = function(a: any, b: any, invert: boolean): number {
      if (a === null && b === null) return 0
      if (a === null) return 1
      if (b === null) return -1

      const strA = String(a)
      const strB = String(b)

      if (strA < strB) {
        return invert ? 1 : -1
      }
      if (strA > strB) {
        return invert ? -1 : 1
      }
      return 0
    }

    if (sortCompletedLast) {
      const aCompleted = a.completed ? new Date(a.completed) : null
      const bCompleted = b.completed ? new Date(b.completed) : null

      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      if (aCompleted && bCompleted) {
        return bCompleted.getTime() - aCompleted.getTime()
      }
    }

    for (const { value, invert } of sorting) {
      const compareResult = compareValues(a[value], b[value], invert)
      if (compareResult !== 0) {
        return compareResult
      }
    }

    return 0
  }

  function groupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): any {
    const groupTodoObjectsByKey = function(todoObjects: TodoObject[], attributeKey: string) {
      const grouped: TodoGroup = {}
      for (const todoObject of todoObjects) {
        const groupKey = todoObject[attributeKey] || null
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            title: groupKey,
            todoObjects: [],
            visible: false
          }
        }

        grouped[groupKey].todoObjects.push(todoObject)
        grouped[groupKey].visible = grouped[groupKey].todoObjects.some((todoObject) => {
          return !todoObject.hidden || (showHidden && todoObject.hidden)
        })
      }
      return Object.values(grouped)
    }    
    const { value } = sorting[0]
    const grouped = groupTodoObjectsByKey(todoObjects, value)
    return grouped
  }

  if (fileSorting) {
    return [
      {
        title: null,
        todoObjects: todoObjects,
        visible: true
      }
    ]
  }

  const sortedTodoObjects = [...todoObjects].sort((a, b) => sortTodoObjects(a, b, sorting))
  const sortedAndGroupedTodoObjects = groupTodoObjects(sortedTodoObjects, sorting)
  return sortedAndGroupedTodoObjects
}

export { sortAndGroupTodoObjects }
