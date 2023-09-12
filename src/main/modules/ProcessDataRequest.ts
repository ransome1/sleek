import fs from 'fs';
import path from 'path';
import { getActiveFile } from './ActiveFile';
import { configStorage, filterStorage } from '../config';
import { updateAttributes, applyFilters } from './Filters';
import { createTodoObjects } from './CreateTodoObjects';
import { File, Filter, Attributes, RequestedData, Headers, Sorting, TodoObject } from '../util';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString, handleTodoObjectsDates } from './ProcessTodoObjects';

const headers: Headers = {
  availableObjects: 0,
  visibleObjects: 0,
};

async function processDataRequest(searchString: string): Promise<RequestedData[]> {
  try {
    const files: File[] = configStorage.get('files');
    const file: File | null = getActiveFile(files);

    if (file === null) {
      return Promise.resolve([]);
    }

    let attributes: Attributes = {
      priority: {},
      projects: {},
      contexts: {},
      due: {},
      t: {},
      rec: {},
      pm: {},
      created: {},
      completed: {},
    };    

    const showCompleted: boolean = configStorage.get('showCompleted');
    const showHidden: boolean = configStorage.get('showHidden');
    const sorting: Sorting[] = configStorage.get('sorting');
    const fileSorting: boolean = configStorage.get('fileSorting');
    const filters: object = filterStorage.get('filters');
    const thresholdDateInTheFuture: boolean = configStorage.get('thresholdDateInTheFuture');
    const dueDateInTheFuture: boolean = configStorage.get('dueDateInTheFuture');

    const fileContent = await fs.promises.readFile(path.join(file.path, '', file.todoFile), 'utf8');

    let todoObjects: TodoObject[];
    
    todoObjects = await createTodoObjects(fileContent);

    headers.availableObjects = countTodoObjects(todoObjects);

    if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects);

    if(!thresholdDateInTheFuture || !dueDateInTheFuture) todoObjects = handleTodoObjectsDates(todoObjects, dueDateInTheFuture, thresholdDateInTheFuture);

    todoObjects = handleCompletedTodoObjects(todoObjects, showCompleted);

    attributes = updateAttributes(attributes, todoObjects, false);

    if (filters) todoObjects = applyFilters(todoObjects, filters);
    
    if (searchString) todoObjects = applySearchString(searchString, todoObjects);

    headers.visibleObjects = countTodoObjects(todoObjects);

    attributes = updateAttributes(attributes, todoObjects, true);

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