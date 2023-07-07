import store from '../config';

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

  if(hideCompleted) {
    const filteredTodoObjects: TodoObject[] = Object.values(todoObjects)
    .flat()
    .filter((object: TodoObject | null) =>
      object && object.complete === !hideCompleted
    );
    return filteredTodoObjects;
  }
  return todoObjects; 
}

function groupTodoObjects(todoObjects: TodoObjects, grouping: string): TodoObjects {
  const groupedTodoObjects: TodoObjects = Object.entries(todoObjects).reduce(
    (groups: TodoObjects, [key, todoObject]) => {
      if (todoObject !== null) {
        const groupTitle: string = todoObject[grouping as keyof typeof todoObject] ?? '';
        const groupKey = groupTitle || '';
        groups[groupKey] = groups[groupKey] ?? [];
        groups[groupKey].push(todoObject);
      }
      return groups;
    },
    {}
  );
  return groupedTodoObjects;
}

function sortGroups(groupedTodoObjects: TodoObjects, invert: boolean): TodoObjects {
  if (!groupedTodoObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  const entries = Object.entries(groupedTodoObjects);

  entries.sort(([keyA], [keyB]) => {
    if (keyA.length === 0 && keyB.length > 0) {
      return 1;
    }
    if (keyA.length > 0 && keyB.length === 0) {
      return -1;
    }

    const comparison = invert ? keyB.localeCompare(keyA) : keyA.localeCompare(keyB);
    return comparison;
  });

  return Object.fromEntries(entries) as TodoObjects;
}

function sortTodoObjects(groupedTodoObjects: TodoObjects, sorting: string[], invert: boolean, completedLast: boolean): TodoObjects {
  if (!groupedTodoObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  function getValue(obj: TodoObject, prop: string): any {
    const value = obj[prop];
    return value && value.value !== undefined ? value.value : value;
  }

  function compareStrings(a: any, b: any): number {
    const stringA = String(a);
    const stringB = String(b);
    return stringA.localeCompare(stringB);
  }

  function compareDates(a: any, b: any): number {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    return dateA - dateB;
  }

  for (const method of sorting.reverse()) {
    for (const group of Object.values(groupedTodoObjects)) {
      group.sort((a: TodoObject, b: TodoObject) => {
        const valueA = getValue(a, method);
        const valueB = getValue(b, method);

        if (method === 'projects' || method === 'contexts') {
          return invert ? compareStrings(valueB, valueA) : compareStrings(valueA, valueB);
        }

        if (!valueA) return 1;
        if (!valueB) return -1;

        return compareDates(valueA, valueB);
      });

      if (completedLast) {
        group.sort((a: TodoObject, b: TodoObject) => {
          if (a.complete && !b.complete) return 1;
          if (!a.complete && b.complete) return -1;
          return 0;
        });
      }
    }
  }

  return groupedTodoObjects;
}

export {
  groupTodoObjects,
  countTodoObjects,
  sortGroups,
  sortTodoObjects,
  applySearchString,
  handleCompletedTodoObjects
};