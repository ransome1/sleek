import { getActiveFile } from '../File/Active';
import { readFileContent } from '../File/File';
import { config, filter } from '../../config';
import { applySearchString } from '../Filters/Search';
import { applyAttributes, handleHiddenTodoObjects, handleCompletedTodoObjects, handleTodoObjectsDates } from '../Filters/Filters';
import { updateAttributes, attributes } from '../Attributes';
import { createTodoObjects } from './CreateTodoObjects';
import { mainWindow } from '../../main';
import { sortAndGroupTodoObjects, flattenTodoObjects } from './ProcessTodoObjects';

let searchString: string;
let headers: HeadersObject = {
  availableObjects: 0,
  visibleObjects: 0
}
let todoObjects: TodoObject[];

function processDataRequest(search?: string): RequestedData {
  searchString = search || '';

  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    return;
  }
  const sorting: Sorting[] = config.get('sorting');
  const showHidden: boolean = config.get('showHidden');
  const fileSorting: boolean = config.get('fileSorting');
  const filters: Filters = filter.get('attributes');

  const fileContent = readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark);

  todoObjects = createTodoObjects(fileContent);

  headers.availableObjects = todoObjects.length;

  todoObjects = handleTodoObjectsDates(todoObjects);

  const completedTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    return todoObject.complete;
  });
  
  headers.completedObjects = completedTodoObjects.length;
  
  todoObjects = handleCompletedTodoObjects(todoObjects);  

  updateAttributes(todoObjects, sorting, true);

  if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects);

  if(filters) todoObjects = applyAttributes(todoObjects, filters);

  if(searchString) todoObjects = applySearchString(searchString, todoObjects);

  updateAttributes(todoObjects, sorting, false);

  const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    return todoObject.visible;
  });

  headers.visibleObjects = visibleTodoObjects.length;

  if(fileSorting) {
    todoObjects = flattenTodoObjects(todoObjects, '');
  } else {
    const sortedAndGroupedTodos: TodoObject[] = sortAndGroupTodoObjects(todoObjects, sorting);
    todoObjects = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);
  }

  const requestedData: RequestedData = {
    todoObjects,
    attributes,
    headers,
    filters,
  };

  return requestedData;
}

export { processDataRequest, searchString };
