"use strict";

import fs from 'fs';
import { Item } from 'jsTodoTxt';
import { store, mainWindow } from '../main.ts';

async function processTodoTxtObjects(file) {
  try {
    const fileContent = await fs.readFileSync(file, 'utf8');
    const todoTxtObjects = sortTodoTxtObjects(groupTodoTxtObjects(createTodoTxtObjects(fileContent)));
    return todoTxtObjects;
  } catch (error) {
    throw error;
  }
}

function createTodoTxtObjects(fileContent) {
  if (!fileContent) {
    throw new Error("No file content found");
  }

  const lines = fileContent.split('\n');
  const todoTxtObjects = lines.map((line, i) => {
    const item = new Item(line);
    const extensions = item.extensions();
    const due = extensions.find(extension => extension.key === "due")?.value || null;
    const t = extensions.find(extension => extension.key === "t")?.value || null;
    const rec = extensions.find(extension => extension.key === "rec")?.value || null;

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
      rec
    };
  });

  return todoTxtObjects;
}

function groupTodoTxtObjects(todoTxtObjects) {
  if (!todoTxtObjects) {
    throw new Error("No todo.txt objects found");
  }

  const grouping = store.get('grouping');
  const groupedTodoTxtObjects = todoTxtObjects.reduce((result, todoTxtObject) => {
    const groupTitle = todoTxtObject[grouping] ?? null;
    result[groupTitle] ??= [];
    result[groupTitle].push(todoTxtObject);
    return result;
  }, {});

  return sortGroups(groupedTodoTxtObjects);
}

function sortGroups(groupedTodoTxtObjects) {
  if (!groupedTodoTxtObjects) {
    throw new Error("No grouped todo.txt objects found");
  }

  const entries = Object.entries(groupedTodoTxtObjects);
  entries.sort((a, b) => (store.get('invertGroupSorting') ? b[0] : a[0]).localeCompare(b[0]));

  entries.sort((a, b) => {
    if (a[0] === 'null') return 1;
    if (b[0] === 'null') return -1;
  });

  return Object.fromEntries(entries);
}

function sortTodoTxtObjects(groupedTodoTxtObjects) {
  if (!groupedTodoTxtObjects) {
    throw new Error("No grouped todo.txt objects found");
  }

  const sorting = store.get('sorting').reverse();
  const sortCompletedAtTheEnd = store.get('sortCompletedAtTheEnd');

  for (const method of sorting) {
    for (const group of Object.values(groupedTodoTxtObjects)) {
      group.sort((a, b) => {
        if (!a[method]) return 1;
        if (!b[method]) return -1;
        if (a[method].value) a[method] = a[method].value;
        if (b[method].value) b[method] = b[method].value;
        return new Date(a[method]) - new Date(b[method]);
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
