import fs from 'fs';
import { Item } from 'jstodotxt';
import { mainWindow } from '../main';
import { configStorage, filterStorage } from '../config';
import { createAttributesObject, applyFilters } from './Filters';
import { handleCompletedTodoObjects, groupTodoObjects, countTodoObjects, applySearchString, sortTodoObjects, sortGroups } from './ProcessTodoObjects';

let todoObjects: Record<string, any>;
let lines: string[];
const headers = {
  availableObjects: 0,
  visibleObjects: 0,
};

async function processDataRequest(file: string, searchString: string) {
  if (!file) {
    mainWindow?.webContents.send('showSplashScreen', 'noFiles');
    return 'processDataRequest: No file passed';
  }

  const hideCompleted: boolean = configStorage.get('hideCompleted', false);
  const sorting: string[] = configStorage.get('sorting', [
    "priority",
    "due",
    "projects",
    "contexts",
    "t",
    "completed",
    "created"
  ]);
  const grouping = sorting[0];
  const invertGroups: boolean = configStorage.get('invertGroups', false);
  const invertSorting : boolean = configStorage.get('invertSorting', false);
  const completedLast : boolean = configStorage.get('completedLast', false);
  const filters : object = filterStorage.get('filters', {});

  const fileContent = await fs.promises.readFile(file, 'utf8');

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

  if (headers.availableObjects === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'noTodosAvailable', attributes, headers, filters);
    return 'No todos available';
  } else if (headers.visibleObjects === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'noTodosVisible', attributes, headers, filters);
    return 'No todos visible';
  } else {
    mainWindow?.webContents.send('requestData', sortedTodoObjects, attributes, headers, filters);
    return 'todo.txt objects and attributes created and sent to renderer';
  }
}

function createTodoObjects(fileContent: string) {
  lines = fileContent.split('\n');
  const todoObjects = lines
    .map((line, i) => {
      const item = new Item(line);
      const extensions = item.extensions();
      const due = extensions.find((extension) => extension.key === 'due')?.value || null;
      //const tags = extensions.find((extension) => extension.key === 'tag')?.value || null;
      const t = extensions.find((extension) => extension.key === 't')?.value || null;
      const hidden = extensions.find((extension) => extension.key === 'h')?.value || null;
      const pm = extensions.find((extension) => extension.key === 'pm')?.value || null;
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
        hidden,
        //tags,
        pm,
        string: item.toString(),
        group: null,
      };
    })
    .filter((todoObject) => todoObject !== null);
  return todoObjects;
}

export default processDataRequest;
export { lines, todoObjects };