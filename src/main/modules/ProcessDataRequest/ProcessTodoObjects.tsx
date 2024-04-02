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
  flattenTodoObjects,
  sortAndGroupTodoObjects
};