import fs from 'fs';
import { Item } from 'jsTodoTxt';
import { mainWindow } from '../main';
import store from '../config';

export let todoTxtObjects: Record<string, any>;
export let lines: string[];

async function processTodoTxtObjects(file: string): Promise<void> {

  if(!file) return

  const fileContent = await fs.promises.readFile(file, 'utf8');
  todoTxtObjects = await createTodoTxtObjects(fileContent);
  const groupedTodoTxtObjects = await groupTodoTxtObjects(Object.values(todoTxtObjects));
  const sortedTodoTxtObjects = await sortTodoTxtObjects(groupedTodoTxtObjects);
  todoTxtObjects = sortedTodoTxtObjects;
  if (Object.keys(todoTxtObjects).length === 0) {
    mainWindow?.webContents.send('showSplashScreen', 'noTodoTxtObjects');
  } else {
    mainWindow?.webContents.send('receiveTodoTxtObjects', todoTxtObjects);
  }
}

function createTodoTxtObjects(fileContent: string): (object | null)[] {
  lines = fileContent.split('\n');

  const todoTxtObjects = lines.map((line, i) => {
    const item = new Item(line);
    const extensions = item.extensions();
    const due = extensions.find((extension) => extension.key === 'due')?.value || null;
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

function sortGroups(groupedTodoTxtObjects: Record<string, any[]>): Record<string, any[]> {
  if (!groupedTodoTxtObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  const invertGroupSorting = store.get('invertGroupSorting');
  const entries = Object.entries(groupedTodoTxtObjects);

  entries.sort((a, b) => {
    // if (a[0] === 'null') return 1;
    // if (b[0] === 'null') return -1;
    if (invertGroupSorting) {
      return b[0].localeCompare(a[0]);
    } else {
      return a[0].localeCompare(b[0]);
    }
  });

  return Object.fromEntries(entries);
}

function sortTodoTxtObjects(groupedTodoTxtObjects: Record<string, any[]>): Record<string, any[]> {
  if (!groupedTodoTxtObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  const sorting = store.get('sorting') as string[] ?? [];
  const sortCompletedAtTheEnd = store.get('sortCompletedAtTheEnd');

  for (const method of sorting.reverse()) {
    for (const group of Object.values(groupedTodoTxtObjects)) {
      group.sort((a, b) => {
        if (!a[method]) return 1;
        if (!b[method]) return -1;
        if (a[method].value) a[method] = a[method].value;
        if (b[method].value) b[method] = b[method].value;
        return new Date(a[method]).getTime() - new Date(b[method]).getTime();
      });

      if (sortCompletedAtTheEnd) {
        group.sort((a, b) => {
          if (a.complete && !b.complete) return 1;
          if (!a.complete && b.complete) return -1;
          return 0;
        });
      }
    }
  }

  return groupedTodoTxtObjects;
}

export default processTodoTxtObjects;
