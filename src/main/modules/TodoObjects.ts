import fs from 'fs';
import { Item } from 'jsTodoTxt';
import { mainWindow } from '../main';
import store from '../config';
import { createFiltersObject } from './Filters';
import { handleCompletedTodoObjects, groupTodoObjects, countTodoObjects, applySearchString, sortTodoObjects, sortGroups } from './ProcessTodoObjects';

let todoObjects: Record<string, any>;
let lines: string[];
const headers = {
  availableObjects: 0,
  visibleObjects: 0,
};

async function processDataRequest(file: string, searchString: string) {
  if (!file) {
    return;
  }

  const hideCompleted: boolean = store.get('hideCompleted');
  const grouping: string = store.get('sorting')[0];
  const invertGroups: boolean = store.get('invertGroups');
  const sorting: string[] = store.get('sorting');
  const invertSorting : boolean = store.get('invertSorting');
  const completedLast : boolean = store.get('completedLast');

  const fileContent = await fs.promises.readFile(file, 'utf8');
  todoObjects = await createTodoObjects(fileContent);

  headers.availableObjects = countTodoObjects(todoObjects);

  todoObjects = handleCompletedTodoObjects(todoObjects, hideCompleted);
  
  if (searchString) {
    todoObjects = applySearchString(searchString, todoObjects);
  }

  headers.visibleObjects = countTodoObjects(todoObjects);

  const groupedTodoObjects = groupTodoObjects(todoObjects, grouping);
  const sortedGroups = sortGroups(groupedTodoObjects, invertGroups);
  const sortedTodoObjects = sortTodoObjects(sortedGroups, sorting, invertSorting, completedLast);
  const filters = createFiltersObject(sortedTodoObjects);

  if (headers.visibleObjects === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'notodoObjects', filters, headers);
    return 'No todo.txt objects created, showing splashscreen';
  } else {
    mainWindow?.webContents.send('requestData', sortedTodoObjects, filters, headers);
    return 'todo.txt objects and filters created and sent to renderer';
  }
}

function createTodoObjects(fileContent: string) {
  lines = fileContent.split('\n');
  const todoObjects = lines
    .map((line, i) => {
      const item = new Item(line);
      const extensions = item.extensions();
      const due = extensions.find((extension) => extension.key === 'due')?.value || null;
      const tags = extensions.find((extension) => extension.key === '#') || null;
      const t = extensions.find((extension) => extension.key === 't')?.value || null;
      const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
      if (!item.body()) {
        return null;
      }
      return {
        id: i,
        body: item.body(),
        created: item.created(),
        complete: item.complete(),
        priority: item.priority(),
        contexts: item.contexts(),
        projects: item.projects(),
        due,
        t,
        rec,
        tags,
        string: item.toString(),
        group: null,
      };
    })
    .filter((todoObject) => todoObject !== null);
  return todoObjects;
}

export default processDataRequest;
export { lines, todoObjects };