import dayjs from 'dayjs';
import * as FilterLang from '../Filters/FilterLang.js';
import { runQuery } from '../Filters/FilterQuery';
import { createTodoObject } from './CreateTodoObjects';
import { config } from '../../config';

function countTodoObjects(todoObjects: TodoObject[]): HeadersObject {
  const filteredObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    return todoObject.visible;
  });

  const completedObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    if(todoObject.complete) return todoObject.complete;
  });

  const headers: HeadersObject = {
    availableObjects: todoObjects.length,
    visibleObjects: filteredObjects.length,
    completedObjects: completedObjects.length
  }

  return headers;
}

function checkForSearchMatches(todoString: string, searchString: string) {
  try {
    const todoObject = createTodoObject(-1, todoString);
    const query = FilterLang.parse(searchString);
    return runQuery(todoObject, query);
  } catch (error) {
    return todoString.toLowerCase().includes(searchString);
  }
}

function applySearchString(searchString: string, todoObjects: TodoObject[]): TodoObject[] {
  try {
    const query = FilterLang.parse(searchString);
    return todoObjects.map(todoObject => {
      if(!todoObject.visible) return todoObject;
      todoObject.visible = runQuery(todoObject, query);
      return todoObject;
    });
  } catch (error) {
    const lowerSearchString = searchString.toLowerCase();
    return Object.values(todoObjects)
      .flat()
      .map(todoObject => {
        if(!todoObject.visible) return todoObject;
        todoObject.visible = todoObject?.string?.toLowerCase().includes(lowerSearchString) || false;
        return todoObject;
      }) as TodoObject[];
  }
}

function handleCompletedTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  const showCompleted: boolean = config.get('showCompleted');
  return todoObjects.map((todoObject: TodoObject) => {
    if(todoObject.complete && !showCompleted) {
      todoObject.visible = false;
    }
    return todoObject;
  });
}

function handleHiddenTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  return todoObjects.map((todoObject: TodoObject) => {
    if(!todoObject.visible) return todoObject;
    todoObject.visible = todoObject.visible && !todoObject.hidden;
    return todoObject;
  });
}

function handleTodoObjectsDates(todoObjects: TodoObject[]): TodoObject[] {
  const thresholdDateInTheFuture: boolean = config.get('thresholdDateInTheFuture');
  const dueDateInTheFuture: boolean = config.get('dueDateInTheFuture');

  return todoObjects.map((todoObject: TodoObject) => {

    if(!todoObject.visible) return todoObject;
    
    const thresholdDate = dayjs(todoObject?.t);
    const dueDate = dayjs(todoObject?.due);

    if(thresholdDate && thresholdDate.isAfter(dayjs()) && !thresholdDateInTheFuture) {
      todoObject.visible = false;  
    } else if(dueDate && dueDate.isAfter(dayjs()) && !dueDateInTheFuture) {
      todoObject.visible = false;  
    }

    return todoObject;
  });
}

function sortAndGroupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): TodoObject[] {
    function compareValues(a: any, b: any, invert: boolean): number {
      const comparison = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
      return invert ? -comparison : comparison;
    }

    function sortObjectsBySorting(a: any, b: any): number {
      for (const { value, invert } of sorting) {
        const compareResult = compareValues(a[value], b[value], invert);
        if(compareResult !== 0) {
          return compareResult;
        }
      }
      return 0;
    }

    function groupObjectsByKey(objects: any[], key: string): { [key: string]: any[] } {
      const grouped: { [key: string]: any[] } = {};

      for (const obj of objects) {
        const groupKey = obj[key] || '';
        if(!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(obj);
      }
      return grouped;
    }

    function sortAndGroupObjects(objects: any[], sortIndex: number, sorting: Sorting[]): any {
      if(sortIndex >= sorting.length) {
        return objects;
      }

      const { value } = sorting[sortIndex];
      const grouped = groupObjectsByKey(objects, value);
      const sortedKeys = Object.keys(grouped);

      if(sortedKeys.includes('')) {
        sortedKeys.splice(sortedKeys.indexOf(''), 1);
        sortedKeys.push('');
      }

      const sortedGroups: { [key: string]: any } = {};
      for (const key of sortedKeys) {
        sortedGroups[key] = sortAndGroupObjects(grouped[key], sortIndex + 1, sorting);
      }
      return sortedGroups;
    }

    const sortedTodoObjects = Object.values(todoObjects).sort(sortObjectsBySorting);

    return sortAndGroupObjects(sortedTodoObjects, 0, sorting);
}

function flattenTodoObjects(todoObjects: TodoObject[], topLevelGroup: string): TodoObject[] {
  const flattenedObjects: TodoObject[] = [];
  const flatten = (todoObject: any, sortingKey: string) => {
    if(typeof todoObject === 'object' && todoObject !== null) {
      if('id' in todoObject) {
        flattenedObjects.push(todoObject);
      }
      for (const key in todoObject) {
        if(key !== sortingKey && typeof todoObject[key] === 'object') {
          flatten(todoObject[key], sortingKey);
        }
      }
    }
  }
  for (const key in todoObjects) {
    flatten(todoObjects[key], topLevelGroup);
  }
  return flattenedObjects;
}

export {
  handleHiddenTodoObjects,
  flattenTodoObjects,
  sortAndGroupTodoObjects,
  countTodoObjects,
  applySearchString,
  handleCompletedTodoObjects,
  handleTodoObjectsDates,
  checkForSearchMatches,
};
