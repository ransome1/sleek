import { app } from 'electron';
import fs from 'fs';
import { getActiveFile } from './File/Active';
import { extractTodosFromFile } from './File/Archive';
import { configStorage, filterStorage } from '../config';
import { applyFilters } from './Filters';
import { updateAttributes, attributes } from './Attributes';
import { createTodoObjects } from './TodoObject/CreateTodoObjects';
import { File, RequestedData, Headers, Sorting, TodoObject } from '../util';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, countCompletedTodoObjects, applySearchString, handleTodoObjectsDates } from './TodoObject/ProcessTodoObjects';

const headers: Headers = {
  availableObjects: 0,
  visibleObjects: 0,
  completedTodoObjects: 0,
};

let stopAccessingSecurityScopedResource;

async function processDataRequest(searchString: string): Promise<RequestedData[]> {
  try {
    const files: File[] = configStorage.get('files');
    const file: File | null = getActiveFile(files);

    if (file === null) {
      return Promise.resolve([]);
    }

    const sorting: Sorting[] = configStorage.get('sorting');
    const showCompleted: boolean = configStorage.get('showCompleted');
    const showHidden: boolean = configStorage.get('showHidden');
    const fileSorting: boolean = configStorage.get('fileSorting');
    const filters: object = filterStorage.get('filters');
    const thresholdDateInTheFuture: boolean = configStorage.get('thresholdDateInTheFuture');
    const dueDateInTheFuture: boolean = configStorage.get('dueDateInTheFuture');

    const bookmark = file.todoFileBookmark;
    
    let stopAccessingSecurityScopedResource;
    if (bookmark) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);

    const fileContent = await fs.promises.readFile(file.todoFilePath, 'utf8');

    if (bookmark) stopAccessingSecurityScopedResource();
    
    let todoObjects: TodoObject[];

    todoObjects = createTodoObjects(fileContent);

    if(!thresholdDateInTheFuture || !dueDateInTheFuture) todoObjects = handleTodoObjectsDates(todoObjects, dueDateInTheFuture, thresholdDateInTheFuture);

    headers.availableObjects = countTodoObjects(todoObjects);

    headers.completedTodoObjects = countCompletedTodoObjects(todoObjects);

    todoObjects = handleCompletedTodoObjects(todoObjects, showCompleted);

    updateAttributes(todoObjects, sorting, true);

    if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects);

    if (filters) todoObjects = applyFilters(todoObjects, filters);

    if (searchString) todoObjects = applySearchString(searchString, todoObjects);

    headers.visibleObjects = countTodoObjects(todoObjects);

    updateAttributes(todoObjects, sorting, false);

    if(fileSorting) {
      const flattenedTodoObjects: any = flattenTodoObjects(todoObjects, '');
      return Promise.resolve([flattenedTodoObjects, attributes, headers, filters]);
    }

    const sortedAndGroupedTodos = sortAndGroupTodoObjects(todoObjects, sorting);

    const flattenedTodoObjects: any = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);

    return Promise.resolve([flattenedTodoObjects, attributes, headers, filters]);

  } catch(error) {
    return Promise.reject(error);
  }
}

export default processDataRequest;
