type TodoObject = Record<string, any>;
type TodoObjects = Record<string, TodoObject>;

function countTodoObjects(todoObjects: TodoObjects): number {
  const count = Object.values(todoObjects)
    .flatMap((objects: TodoObject) => objects)
    .filter((object: TodoObject | null) => object && object.group !== false);
  return count.length;
}

function applySearchString(searchString: string, todoObjects: TodoObjects): TodoObject {
  const lowerSearchString = searchString.toLowerCase();
  const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.string.toLowerCase().includes(lowerSearchString)
    );
  return filteredTodoObjects;
}

function handleCompletedTodoObjects(todoObjects: TodoObjects, hideCompleted: boolean): TodoObject {
  const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.complete === !hideCompleted
    );
    return filteredTodoObjects;
}

function sortAndGroupTodoObjects(todoObjects, sorting) {
  function compareValues(a, b, invert) {
    if (a === null || a === undefined || a === '') {
      return invert ? -1 : 1;
    } else if (b === null || b === undefined || b === '') {
      return invert ? 1 : -1;
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return invert ? b - a : a - b;
    } else {
      return invert
        ? String(b).localeCompare(String(a), undefined, { sensitivity: 'base' })
        : String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
    }
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

  function sortAndGroupWithException(todoObjects, sortIndex) {
    if (sortIndex >= sorting.length) {
      return todoObjects;
    }

    const { value, invert } = sorting[sortIndex];
    const groupedObjects = {};

    for (const todoObject of todoObjects) {
      const groupKey = todoObject[value] || '';
      if (!groupedObjects[groupKey]) {
        groupedObjects[groupKey] = [];
      }
      groupedObjects[groupKey].push(todoObject);
    }

    const sortedKeys = Object.keys(groupedObjects);

    // Remove the 'null' key from the sortedKeys if it exists
    const nullIndex = sortedKeys.indexOf('');
    if (nullIndex !== -1) {
      sortedKeys.splice(nullIndex, 1);
    }

    // Sort the remaining keys based on the provided sorting criteria
    sortedKeys.sort((a, b) => (invert ? compareValues(b, a) : compareValues(a, b)));

    // Add the 'null' key back at the end
    if (nullIndex !== -1) {
      sortedKeys.push('');
    }

    const sortedGroups = {};
    for (const key of sortedKeys) {
      sortedGroups[key] = sortAndGroupWithException(groupedObjects[key], sortIndex + 1);
    }

    return sortedGroups;
  }

  return sortAndGroupWithException(todoObjects.sort(sortObjectsBySorting), 0);
}



function flattenTodoObjects(todoObjects, topLevelKey) {
  function flatten(obj, sortingKey) {
    const result = [];

    if (typeof obj !== 'object' || obj === null) {
      return result;
    }

    if ('id' in obj) {
      result.push(obj);
    }

    for (const key in obj) {
      if (key === sortingKey) continue;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result.push(...flatten(obj[key], sortingKey));
      }
    }

    return result;
  }

  const flattenedObjects = [];
  for (const key in todoObjects) {
    const separatorEntry = {
      group: topLevelKey,
      value: key,
    };
    flattenedObjects.push(separatorEntry);
    flattenedObjects.push(...flatten(todoObjects[key], topLevelKey));
  }

  return flattenedObjects;
}

export {
  flattenTodoObjects,
  sortAndGroupTodoObjects,
  countTodoObjects,
  applySearchString,
  handleCompletedTodoObjects
};