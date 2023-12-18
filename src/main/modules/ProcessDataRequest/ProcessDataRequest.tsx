import { getActiveFile } from '../File/Active';
import { readFileContent } from '../File/File';
import { configStorage, filterStorage } from '../../config';
import { applyFilters } from '../Filters/Filters';
import { updateAttributes, attributes } from '../Attributes';
import { createTodoObjects } from './CreateTodoObjects';
import { mainWindow } from '../../main';
import { handleHiddenTodoObjects, handleCompletedTodoObjects, sortAndGroupTodoObjects, flattenTodoObjects, countTodoObjects, applySearchString, handleTodoObjectsDates } from './ProcessTodoObjects';

const headers: HeadersObject = {
  availableObjects: 0,
  visibleObjects: 0,
  completedTodoObjects: 0,
};

async function processDataRequest(searchString: string): Promise<void> {
  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    throw new Error('No active file');
  }
  const sorting: Sorting[] = configStorage.get('sorting');
  const showHidden: boolean = configStorage.get('showHidden');
  const fileSorting: boolean = configStorage.get('fileSorting');
  const filters: Filters = filterStorage.get('filters');
  const fileContent = await readFileContent(activeFile.todoFilePath, activeFile.todoFileBookmark);
  let todoObjects: TodoObject[] | [] = await createTodoObjects(fileContent);

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

  let flattenedTodoObjects: TodoObject[];

  if(fileSorting) {
    flattenedTodoObjects = flattenTodoObjects(todoObjects, '');
  } else {
    const sortedAndGroupedTodos: TodoObject[] = sortAndGroupTodoObjects(todoObjects, sorting);
    flattenedTodoObjects = flattenTodoObjects(sortedAndGroupedTodos, sorting[0].value);
  }

  const requestedData: RequestedData = {
      flattenedTodoObjects,
      attributes,
      headers,
      filters,
  };

  mainWindow!.webContents.send('requestData', requestedData);
}

export default processDataRequest;
