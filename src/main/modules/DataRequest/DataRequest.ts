import { getActiveFile } from '../File/Active'
import { readFileContent } from '../File/File'
import { config } from '../../config'
import { FilterStore } from '../../FilterStore'
import { applySearchString } from '../Filters/Search'
import { applyAttributes, handleCompletedTodoObjects, handleTodoObjectsDates } from '../Filters/Filters'
import { updateAttributes, attributes } from '../Attributes'
import { createTodoObjects } from './CreateTodoObjects'
import { sortTodoObjects } from './Sort'
import { groupTodoObjects } from './Group'

let searchString: string
const headers: HeadersObject = {
  availableObjects: null,
  completedObjects: null,
  visibleObjects: null
}
let todoObjects: TodoObject[]

function dataRequest(search: string = ''): RequestedData {

  const activeFile: FileObject | null = getActiveFile()
  if (!activeFile) {
    return false
  }

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark)

  const sorting: Sorting[] = config.get('sorting')
  const filters: Filters = FilterStore.get('attributes')
  const showHidden: boolean = config.get('showHidden')
  const fileSorting = config.get('fileSorting');

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

  if (search) todoObjects = applySearchString(search, todoObjects)

  updateAttributes(todoObjects, sorting, false)

  if (showHidden) {
    headers.visibleObjects = todoObjects.length
  } else {
    const visibleObjects = todoObjects.filter((todoObject) => !todoObject.hidden)
    headers.visibleObjects = visibleObjects.length
    todoObjects = visibleObjects
  }

  let todoData;

  if (fileSorting) {
    todoData = [
      {
        title: null,
        todoObjects,
        visible: true,
      },
    ];
  } else {
    todoObjects.sort((a, b) => sortTodoObjects(a, b, sorting));
    todoData = groupTodoObjects(todoObjects, sorting[0].value);
  }

  const requestedData: RequestedData = {
    todoData,
    attributes,
    headers,
    filters
  }

  return requestedData
}

export { dataRequest, searchString }
