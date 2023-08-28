import fs from 'fs';
import path from 'path';
import { getActiveFile } from './ActiveFile';
import { configStorage, filterStorage } from '../config';
import { updateAttributes, applyFilters } from './Filters';
import { createTodoObjects } from './CreateTodoObjects';
import { mainWindow } from '../main';
import { File, Filter, Attributes, RequestedData, Headers } from '../util';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString } from './ProcessTodoObjects';

const headers: Headers = {
  availableObjects: null,
  visibleObjects: null,
};

async function processDataRequest(searchString: string): Promise<RequestedData | null> {
  try {
    const files: File[] = configStorage.get('files');
    const file: File = getActiveFile(files);
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

    if (file === null) return Promise.resolve(null)

    const showCompleted: boolean = configStorage.get('showCompleted');
    const showHidden: boolean = configStorage.get('showHidden');
    const sorting: string[] = configStorage.get('sorting');
    const fileSorting: boolean = configStorage.get('fileSorting');
    const filters: object = filterStorage.get('filters');

    const fileContent = await fs.promises.readFile(path.join(file.path, '', file.todoFile), 'utf8');

    let todoObjects: TodoObject[];
    
    todoObjects = await createTodoObjects(fileContent);

    if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects, false);

    todoObjects = handleCompletedTodoObjects(todoObjects, showCompleted);

    headers.availableObjects = countTodoObjects(todoObjects);

    attributes = updateAttributes(attributes, todoObjects, false);

    if (filters) todoObjects = applyFilters(todoObjects, filters);
    
    if (searchString) todoObjects = applySearchString(searchString, todoObjects);

    headers.visibleObjects = countTodoObjects(todoObjects);

    attributes = updateAttributes(attributes, todoObjects, true);

    if(fileSorting) {
      const flattenedTodoObjects = flattenTodoObjects(todoObjects, null);
      return Promise.resolve([flattenedTodoObjects, attributes, headers, filters]);
    }

    const sortedAndGroupedTodos = sortAndGroupTodoObjects(todoObjects, sorting);

    const flattenedTodoObjects = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);

    return Promise.resolve([flattenedTodoObjects, attributes, headers, filters]);
  } catch(error) {
    return Promise.reject(error);
  }
}

export default processDataRequest;