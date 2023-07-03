import fs from 'fs';
import { Item } from 'jsTodoTxt';
import { mainWindow } from '../main';
import store from '../config';
import { createFiltersObject } from './Filters';
import { groupTodoTxtObjects, countTodoObjects, applySearchString, sortTodoTxtObjects, sortGroups } from './ProcessTodoTxtObjects';

let todoTxtObjects: Record<string, any>;
let lines: string[];
const headers = {
  availableObjects: 0,
  visibleObjects: 0
}

async function processDataRequest(file: string, searchString: string) {
  if(!file) return
  
  const fileContent = await fs.promises.readFile(file, 'utf8');

  todoTxtObjects = await createTodoTxtObjects(fileContent);
  
  headers.availableObjects = await countTodoObjects(todoTxtObjects);
  
  if(searchString) todoTxtObjects = await applySearchString(searchString, todoTxtObjects);
  
  headers.visibleObjects = await countTodoObjects(todoTxtObjects);

  const groupedTodoTxtObjects = await groupTodoTxtObjects(Object.values(todoTxtObjects), store.get('grouping'));

  const sortedGroups = await sortGroups(groupedTodoTxtObjects, store.get('invertGroupSorting'));

  const sortedTodoTxtObjects = await sortTodoTxtObjects(sortedGroups, store.get('sorting'), store.get('sortCompletedAtTheEnd'));

  const filters = await createFiltersObject(sortedTodoTxtObjects);

  if (headers.visibleObjects === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'noTodoTxtObjects', filters, headers);
    return 'No todo.txt objects created, showing splashscreen';
  } else {
    mainWindow?.webContents.send('receiveData', sortedTodoTxtObjects, filters, headers);  
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
      group: null,
    };

    return todoTxtObject;
  }).filter((todoTxtObject) => todoTxtObject && todoTxtObject.body !== '');

  return todoTxtObjects;
}

export default processDataRequest;
export { lines, todoTxtObjects };