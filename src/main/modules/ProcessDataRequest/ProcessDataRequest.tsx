import { getActiveFile } from '../File/Active';
import { readFileContent } from '../File/File';
import { config, filter } from '../../config';
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

let searchString: string;

async function processDataRequest(search?: string): Promise<void> {
  searchString = search || '';

  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    return;
  }
  const sorting: Sorting[] = config.get('sorting');
  const showHidden: boolean = config.get('showHidden');
  const fileSorting: boolean = config.get('fileSorting');
  const filters: Filters = filter.get('attributes');

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

  mainWindow!.webContents.send('requestData', requestedData);
}

export { processDataRequest, searchString };
