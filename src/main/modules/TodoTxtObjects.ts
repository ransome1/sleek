import fs from 'fs';
import { Item } from 'jsTodoTxt';
import { mainWindow } from '../main';
import store from '../config';
import { createFiltersObject } from './Filters';
import { countTodoObjects, applySearchString, sortTodoTxtObjects, sortGroups } from './ProcessTodoTxtObjects';

let todoTxtObjects: Record<string, any>;
let lines: string[];

async function processDataRequest(file: string, searchString: string) {
  if(!file) return
  const headers = {
    availableObjects: 0,
    visibleObjects: 0
  }

  const fileContent = await fs.promises.readFile(file, 'utf8');

  todoTxtObjects = await createTodoTxtObjects(fileContent);
  
  headers.availableObjects = await countTodoObjects(todoTxtObjects);
  if(searchString) todoTxtObjects = await applySearchString(searchString, todoTxtObjects);
  headers.visibleObjects = await countTodoObjects(todoTxtObjects);

  const groupedTodoTxtObjects = await groupTodoTxtObjects(Object.values(todoTxtObjects));
  const sortedTodoTxtObjects = await sortTodoTxtObjects(groupedTodoTxtObjects);

  if (headers.visibleObjects === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'noTodoTxtObjects', headers);
    return 'No todo.txt objects created, showing splashscreen';
  } else {
    mainWindow?.webContents.send('receiveTodos', sortedTodoTxtObjects, headers);
    // TODO: is this ideal here?
    const filters = await createFiltersObject(sortedTodoTxtObjects);
    mainWindow?.webContents.send('receiveFilters', filters);
  
    return 'todo.txt objects and filters created and send to renderer';
  }
}
function createTodoTxtObjects(fileContent: string) {
  lines = fileContent.split('\n');

  const todoTxtObjects = lines.map((line, i) => {
    const item = new Item(line);
    const extensions = item.extensions();
    const due = extensions.find((extension) => extension.key === 'due')?.value || null;
    const tags = extensions.find((extension) => extension.key === '#') || null;
    const t = extensions.find((extension) => extension.key === 't')?.value || null;
    const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
    const todoTxtObject: Record<string, any> = {
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
    };

    if (todoTxtObject.body === '') {
      return null;
    } else {
      return todoTxtObject;
    }
  });
  return todoTxtObjects;
}
function groupTodoTxtObjects(todoTxtObjects: (object | null)[]): Record<string, any> {
  const grouping = store.get('grouping');
  const groupedTodoTxtObjects: Record<string, any> = {};

  for (const todoTxtObject of todoTxtObjects) {
    if (todoTxtObject !== null) {
      const groupTitle: string = todoTxtObject[grouping as keyof typeof todoTxtObject] ?? '';
      groupedTodoTxtObjects[groupTitle] = groupedTodoTxtObjects[groupTitle] ?? [];
      groupedTodoTxtObjects[groupTitle].push(todoTxtObject);
    }
  }
  return sortGroups(groupedTodoTxtObjects);
}


export default processDataRequest;
export { sortTodoTxtObjects, lines, todoTxtObjects };