import fs from 'fs';
import path from 'path';
import { getActiveFile } from './ActiveFile';
import { configStorage, filterStorage } from '../config';
import { createAttributesObject, applyFilters } from './Filters';
import { createTodoObjects } from './CreateTodoObjects';
import { mainWindow } from '../main';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString } from './ProcessTodoObjects';

interface TodoObjects {
  sortedTodoObjects: Record<string, any>;
  attributes: Record<string, any>;
  headers: {
    availableObjects: number;
    visibleObjects: number;
  };
  filters: object;
}

const headers = {
  availableObjects: null,
  visibleObjects: null,
};

interface File {
  active: boolean;
  path: string;
  filename: string;
}

async function processDataRequest(searchString: string): Promise<TodoObjects | null> {
  try {
    const files: File[] = configStorage.get('files');
    const file = getActiveFile(files);

    if (file === null) return Promise.resolve(null)

    const showCompleted: boolean = configStorage.get('showCompleted');
    const showHidden: boolean = configStorage.get('showHidden');
    const sorting: string[] = configStorage.get('sorting');
    const fileSorting: boolean = configStorage.get('fileSorting');
    const filters: object = filterStorage.get('filters', {});

    const fileContent = await fs.promises.readFile(path.join(file.path, '', file.todoFile), 'utf8');

    let todoObjects: Record<string, any>;
    
    todoObjects = await createTodoObjects(fileContent);

    if(!showHidden) todoObjects = handleHiddenTodoObjects(todoObjects, false);

    todoObjects = handleCompletedTodoObjects(todoObjects, showCompleted);

    headers.availableObjects = countTodoObjects(todoObjects);

    const attributes = createAttributesObject(todoObjects);

    if (filters) todoObjects = applyFilters(todoObjects, filters);
    
    if (searchString) todoObjects = applySearchString(searchString, todoObjects);

    headers.visibleObjects = countTodoObjects(todoObjects);

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