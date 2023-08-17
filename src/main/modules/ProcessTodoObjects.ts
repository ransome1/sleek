type TodoObject = Record<string, any>;
type TodoObjects = Record<string, TodoObject>;

function countTodoObjects(todoObjects: TodoObjects): number {
  const count = Object.values(todoObjects)
    .flatMap((objects: TodoObject) => objects)
    .filter((object: TodoObject | null) => object && object.group !== false);
  return count.length;
}

function applySearchString(searchString: string, todoObjects: TodoObjects): TodoObjects {
  const lowerSearchString = searchString.toLowerCase();
  const filteredTodoObjects: TodoObject = Object.values(todoObjects)
    .flat()
    .filter((todoObject: TodoObject | null) =>
      todoObject && todoObject.string.toLowerCase().includes(lowerSearchString)
    );
  return filteredTodoObjects;
}

function handleCompletedTodoObjects(todoObjects: TodoObjects[], showCompleted: boolean): TodoObjects[] {
  const filteredTodoObjects = todoObjects.filter((todoObject: TodoObject) => {
    if (showCompleted) {
      return true;
    } else {
      return !todoObject.complete;
    }
  });

  return filteredTodoObjects;
}

function handleHiddenTodoObjects(todoObjects: TodoObjects[]): TodoObjects[] {
  const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.hidden === false
    );
    return filteredTodoObjects;
}

function sortAndGroupTodoObjects(todoObjects: TodoObjects, sorting: { id: string, value: string; invert: boolean }[]): TodoObjects[] {
  function compareValues(a: any, b: any, invert: boolean): number {
    const comparison = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
    return invert ? -comparison : comparison;
  }

  function sortObjectsBySorting(a: any, b: any): number {
    for (const { value, invert } of sorting) {
      const compareResult = compareValues(a[value], b[value], invert);
      if (compareResult !== 0) {
        return compareResult;
      }
    }
    return 0;
  }

  function groupObjectsByKey(objects: any[], key: string): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};

    for (const obj of objects) {
      const groupKey = obj[key] || '';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(obj);
    }

    return grouped;
  }

  function sortAndGroupObjects(objects: any[], sortIndex: number): any {
    if (sortIndex >= sorting.length) {
      return objects;
    }

    const { value } = sorting[sortIndex];
    const grouped = groupObjectsByKey(objects, value);
    const sortedKeys = Object.keys(grouped);

    if (sortedKeys.includes('')) {
      sortedKeys.splice(sortedKeys.indexOf(''), 1);
      sortedKeys.push('');
    }

    const sortedGroups: { [key: string]: any } = {};
    for (const key of sortedKeys) {
      sortedGroups[key] = sortAndGroupObjects(grouped[key], sortIndex + 1);
    }
    return sortedGroups;
  }

  const sortedTodoObjects = Object.values(todoObjects).sort(sortObjectsBySorting);
  const sortedAndGrouped = sortAndGroupObjects(sortedTodoObjects, 0);

  return sortedAndGrouped;
}

function flattenTodoObjects(todoObjects: TodoObjects, topLevelGroup: string) {
  const flattenedObjects = [];

  function flatten(todoObject: any, sortingKey: string) {
    if (typeof todoObject === 'object' && todoObject !== null) {
      if ('id' in todoObject) {
        flattenedObjects.push(todoObject);
      }

      for (const key in todoObject) {
        if (key !== sortingKey) {  
          flatten(todoObject[key], sortingKey);
        }
      }
    }
  }
  
  for (const key in todoObjects) {
    if (topLevelGroup !== null) {
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
  handleCompletedTodoObjects
};