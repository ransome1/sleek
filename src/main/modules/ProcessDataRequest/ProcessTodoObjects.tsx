import dayjs from 'dayjs';
import * as FilterLang from '../Filters/FilterLang.js';
import { runQuery } from '../Filters/FilterQuery.js';
import { config } from '../../config';

function countTodoObjects(todoObjects: TodoObject[], completed: boolean): number {
  const filteredTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
    if(completed) {
      return todoObject.complete;
    } else {
      return todoObject;
    }
  });
  return filteredTodoObjects.length;
}

function applySearchString(searchString: string, todoObjects: TodoObject[]): TodoObject[] {
  try {
    const query = FilterLang.parse(searchString);
    return todoObjects.filter(todoObject => runQuery(todoObject, query));
  } catch (error) {
    const lowerSearchString = searchString.toLowerCase();
    return Object.values(todoObjects)
      .flat()
      .filter(todoObject => todoObject?.string?.toLowerCase().includes(lowerSearchString)) as TodoObject[];
  }
}

function handleCompletedTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  const showCompleted: boolean = config.get('showCompleted');
  return todoObjects.filter((todoObject: TodoObject) => {
    if(showCompleted) {
      return true;
    } else {
      return !todoObject.complete;
    }
  });
}

function handleHiddenTodoObjects(todoObjects: TodoObject[]): TodoObject[] {
  return Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && !object.hidden
    );
}

function handleTodoObjectsDates(todoObjects: TodoObject[]): TodoObject[] {
  const thresholdDateInTheFuture: boolean = config.get('thresholdDateInTheFuture');
  const dueDateInTheFuture: boolean = config.get('dueDateInTheFuture');

  return todoObjects.flat().filter((todoObject) => {
    const tDate = dayjs(todoObject?.t);
    const dueDate = dayjs(todoObject?.due);
    if(!dueDateInTheFuture && dueDate && dueDate.isAfter(dayjs())) {
      return false;
    }
    return !(!thresholdDateInTheFuture && tDate && tDate.isAfter(dayjs()));
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

function flattenTodoObjects(todoObjects: TodoObject[], topLevelGroup: string): any {
  const flattenedObjects = [];
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
    if(topLevelGroup) {
      flattenedObjects.push({
        group: topLevelGroup,
        value: key,
      });
    }
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
  handleTodoObjectsDates
};
