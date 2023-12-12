import { app } from 'electron';
import { getActiveFile } from '../File/Active';
import { readFileContent } from '../File/File';
import { extractTodosFromFile } from '../File/Archive';
import { configStorage, filterStorage } from '../../config';
import { applyFilters } from '../Filters/Filters';
import { updateAttributes, attributes } from '../Attributes';
import { createTodoObjects } from './CreateTodoObjects';
import { File, RequestedData, Headers, Sorting, TodoObject, Filters } from '../../util';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString, handleTodoObjectsDates } from './ProcessTodoObjects';

const headers: Headers = {
  availableObjects: 0,
  visibleObjects: 0,
  completedTodoObjects: 0,
};

async function processDataRequest(searchString: string): RequestedData[] { 
  const files: File[] = configStorage.get('files');
  const activeFile: File | null = getActiveFile(files);
  const sorting: Sorting[] = configStorage.get('sorting');
  const showHidden: boolean = configStorage.get('showHidden');
  const fileSorting: boolean = configStorage.get('fileSorting');
  const filters: Filters = filterStorage.get('filters');
  const fileContent = await readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark);
  let todoObjects: TodoObject[] = await createTodoObjects(fileContent);
  
  todoObjects = handleTodoObjectsDates(todoObjects);
  headers.availableObjects = countTodoObjects(todoObjects, false);
  headers.completedTodoObjects = countTodoObjects(todoObjects, true);
  todoObjects = handleCompletedTodoObjects(todoObjects);

  updateAttributes(todoObjects, sorting, true);
  
  if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects);
  if(filters) todoObjects = applyFilters(todoObjects, filters);
  if(searchString) todoObjects = applySearchString(searchString, todoObjects);
  
  headers.visibleObjects = countTodoObjects(todoObjects, false);
  
  updateAttributes(todoObjects, sorting, false);
  
  if(fileSorting) {
    const flattenedTodoObjects: TodoObject[] = flattenTodoObjects(todoObjects, '');
    return [flattenedTodoObjects, attributes, headers, filters];
  } else {
    const sortedAndGroupedTodos: TodoObject[] = sortAndGroupTodoObjects(todoObjects, sorting);
    const flattenedTodoObjects: TodoObject[] = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);
    return [flattenedTodoObjects, attributes, headers, filters];
  }
}

export default processDataRequest;