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
  const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.string.toLowerCase().includes(lowerSearchString)
    );
  return filteredTodoObjects;
}

function handleCompletedTodoObjects(todoObjects, showCompleted) {
  const filteredTodoObjects = todoObjects.filter((object) => {
    if (showCompleted) {
      return true;
    } else {
      return !object.complete;
    }
  });

  return filteredTodoObjects;
}

function handleHiddenTodoObjects(todoObjects: TodoObjects): TodoObjects {
  const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.hidden === false
    );
    return filteredTodoObjects;
}

function sortAndGroupTodoObjects(todoObjects, sorting) {
  function compareValues(a, b, invert) {
    const comparison = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
    return invert ? -comparison : comparison;
  }

  function sortObjectsBySorting(a, b) {
    for (const { value, invert } of sorting) {
      const compareResult = compareValues(a[value], b[value], invert);
      if (compareResult !== 0) {
        return compareResult;
      }
    }
    return 0;
  }

  function groupObjectsByKey(objects, key) {
    const grouped = {};

    for (const obj of objects) {
      const groupKey = obj[key] || '';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(obj);
    }

    return grouped;
  }

  function sortAndGroupObjects(objects, sortIndex) {
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

    const sortedGroups = {};
    for (const key of sortedKeys) {
      sortedGroups[key] = sortAndGroupObjects(grouped[key], sortIndex + 1);
    }

    return sortedGroups;
  }

  const sortedTodoObjects = todoObjects.sort(sortObjectsBySorting);
  const sortedAndGrouped = sortAndGroupObjects(sortedTodoObjects, 0);

  return sortedAndGrouped;
}

function flattenTodoObjects(todoObjects, topLevelGroup) {
  const flattenedObjects = [];

  function flatten(obj, sortingKey) {
    if (typeof obj === 'object' && obj !== null) {
      if ('id' in obj) {
        flattenedObjects.push(obj);
      }

      for (const key in obj) {
        if (key !== sortingKey) {  
          flatten(obj[key], sortingKey);
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