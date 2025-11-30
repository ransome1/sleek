import { getActiveFile } from '../File/Active'
import { readFileContent } from '../File/File'
import { SettingsStore, FiltersStore } from '../Stores'
import { applySearchString } from '../Filters/Search'
import { applyAttributes, handleCompletedTodoObjects, handleTodoObjectsDates } from '../Filters/Filters'
import { updateAttributes, attributes } from '../Attributes'
import { createTodoObjects } from './CreateTodoObjects'
import { sortTodoObjects } from './Sort'
import { groupTodoObjects } from './Group'
import { createBiDailyTodoData, isRestDay, getWeekUnits } from './BiDailyUnit'

let searchString: string
const headers: HeadersObject = {
  availableObjects: null,
  completedObjects: null,
  visibleObjects: null
}
let todoObjects: TodoObject[]

function dataRequest(passedSearchString: string = ''): RequestedData {

  searchString = passedSearchString

  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    return false
  }

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)

  const sorting: Sorting[] = SettingsStore.get('sorting')
  const filters: Filters = FiltersStore.get('attributes')
  const showHidden: boolean = SettingsStore.get('showHidden')
  const fileSorting = SettingsStore.get('fileSorting')
  const biDailyViewEnabled: boolean = SettingsStore.get('biDailyView') ?? false

  todoObjects = createTodoObjects(fileContent)

  headers.availableObjects = todoObjects.length

  todoObjects = handleTodoObjectsDates(todoObjects)

  // todo: should this be improved
  const completedTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    return todoObject.complete
  })

  headers.completedObjects = completedTodoObjects.length

  todoObjects = handleCompletedTodoObjects(todoObjects)

  updateAttributes(todoObjects, sorting, true)

  if (filters) todoObjects = applyAttributes(todoObjects, filters)

  if (searchString) todoObjects = applySearchString(searchString, todoObjects)

  updateAttributes(todoObjects, sorting, false)

  if (showHidden) {
    headers.visibleObjects = todoObjects.length
  } else {
    const visibleObjects = todoObjects.filter((todoObject) => !todoObject.hidden)
    headers.visibleObjects = visibleObjects.length
    todoObjects = visibleObjects
  }

  let todoData
  let biDailyMeta = null

  // Bi-Daily Unit View Mode
  if (biDailyViewEnabled) {
    todoData = createBiDailyTodoData(todoObjects, showHidden)
    const weekUnits = getWeekUnits()
    biDailyMeta = {
      isRestDay: isRestDay(),
      currentUnit: weekUnits.currentUnit,
      weekStart: weekUnits.weekStart.format('YYYY-MM-DD')
    }
  } else if (fileSorting) {
    todoData = [
      {
        title: null,
        todoObjects,
        visible: true,
      },
    ]
  } else {
    todoObjects.sort((a, b) => sortTodoObjects(a, b, sorting))
    todoData = groupTodoObjects(todoObjects, sorting[0].value)
  }

  const requestedData: RequestedData = {
    todoData,
    attributes,
    headers,
    filters,
    biDailyMeta
  }

  return requestedData
}

export { dataRequest, searchString }
