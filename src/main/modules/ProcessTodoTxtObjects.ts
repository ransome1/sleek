import store from '../config';

type TodoTxtObject = Record<string, any>;
type TodoTxtObjects = Record<string, TodoTxtObject[]>;

function countTodoObjects(todoTxtObjects: TodoTxtObjects): number {
  const count = Object.values(todoTxtObjects)
    .flatMap((objects: TodoTxtObject[]) => objects)
    .filter((object: TodoTxtObject | null) => object && object.group !== false);
  return count.length;
}

function applySearchString(searchString: string, todoTxtObjects: TodoTxtObjects): TodoTxtObjects {
  const filteredTodoTxtObjects: TodoTxtObjects = Object.values(todoTxtObjects)
    .flat()
    .filter((object: TodoTxtObject | null) =>
      object && object.string.toLowerCase().includes(searchString.toLowerCase())
    );
  return filteredTodoTxtObjects;
}

function groupTodoTxtObjects(todoTxtObjects: TodoTxtObjects, grouping: string): TodoTxtObjects {
  const groupedTodoTxtObjects: TodoTxtObjects = Object.entries(todoTxtObjects).reduce(
    (groups: TodoTxtObjects, [key, todoTxtObject]) => {
      if (todoTxtObject !== null) {
        const groupTitle: string = todoTxtObject[grouping as keyof typeof todoTxtObject] ?? '';
        groups[groupTitle] = groups[groupTitle] ?? [];
        groups[groupTitle].push(todoTxtObject);
      }
      return groups;
    },
    {}
  );

  return groupedTodoTxtObjects;
}

function sortGroups(groupedTodoTxtObjects: TodoTxtObjects, invertGroupSorting: boolean): TodoTxtObjects {
  if (!groupedTodoTxtObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  const entries = Object.entries(groupedTodoTxtObjects);

  entries.sort(([keyA], [keyB]) => {
    if (keyA.length === 0 && keyB.length > 0) {
      return 1;
    }
    if (keyA.length > 0 && keyB.length === 0) {
      return -1;
    }

    const comparison = invertGroupSorting ? keyB.localeCompare(keyA) : keyA.localeCompare(keyB);
    return comparison;
  });

  return Object.fromEntries(entries) as TodoTxtObjects;
}

function sortTodoTxtObjects(groupedTodoTxtObjects: TodoTxtObjects, sorting: string[], sortCompletedAtTheEnd: boolean): TodoTxtObjects {
  if (!groupedTodoTxtObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  function getValue(obj: TodoTxtObject, prop: string): any {
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
    for (const group of Object.values(groupedTodoTxtObjects)) {
      group.sort((a: TodoTxtObject, b: TodoTxtObject) => {
        const valueA = getValue(a, method);
        const valueB = getValue(b, method);

        if (method === 'projects' || method === 'contexts') {
          return compareStrings(valueA, valueB);
        }

        if (!valueA) return 1;
        if (!valueB) return -1;

        return compareDates(valueA, valueB);
      });

      if (sortCompletedAtTheEnd) {
        group.sort((a: TodoTxtObject, b: TodoTxtObject) => {
          if (a.complete && !b.complete) return 1;
          if (!a.complete && b.complete) return -1;
          return 0;
        });
      }
    }
  }

  return groupedTodoTxtObjects;
}

export {
  groupTodoTxtObjects,
  countTodoObjects,
  sortGroups,
  sortTodoTxtObjects,
  applySearchString
};