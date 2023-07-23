import fs from 'fs';
import { getActiveFile } from './ActiveFile';
import { configStorage, filterStorage } from '../config';
import { createAttributesObject, applyFilters } from './Filters';
import { createTodoObjects, handleCompletedTodoObjects, groupTodoObjects, countTodoObjects, applySearchString, sortTodoObjects, sortGroups } from './ProcessTodoObjects';

const headers = {
  availableObjects: null,
  visibleObjects: null,
};

async function processDataRequest(searchString: string) {
  try {
    const files : object = configStorage.get('files');
    const file = getActiveFile();

    if(file === null) {
      return Promise.resolve(null);
    }
    const fileContent = await fs.promises.readFile(file.path, 'utf8');
    const hideCompleted: boolean = configStorage.get('hideCompleted', false);
    const sorting: string[] = configStorage.get('sorting');
    const grouping = sorting[0];
    const invertGroups: boolean = configStorage.get('invertGroups', false);
    const invertSorting : boolean = configStorage.get('invertSorting', false);
    const completedLast : boolean = configStorage.get('completedLast', false);
    const filters : object = filterStorage.get('filters', {});

    let todoObjects: Record<string, any>;
    
    todoObjects = await createTodoObjects(fileContent);

    headers.availableObjects = countTodoObjects(todoObjects);

    todoObjects = handleCompletedTodoObjects(todoObjects, hideCompleted);

    const attributes = createAttributesObject(todoObjects);

    if (filters) {
      todoObjects = applyFilters(todoObjects, filters);
    }
    
    if (searchString) {
      todoObjects = applySearchString(searchString, todoObjects);
    }

    headers.visibleObjects = countTodoObjects(todoObjects);

    const groupedTodoObjects = groupTodoObjects(todoObjects, grouping);
    const sortedGroups = sortGroups(groupedTodoObjects, invertGroups);
    const sortedTodoObjects = sortTodoObjects(sortedGroups, sorting, invertSorting, completedLast);

    return Promise.resolve([sortedTodoObjects, attributes, headers, filters]);
  } catch(error) {
    return Promise.reject(error);
  }
}



export default processDataRequest;