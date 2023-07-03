import store from '../config';


function countTodoObjects(todoTxtObjects: Record<string, any[]>): Record<string, any[]> {
  const count = todoTxtObjects.filter(object => object && object.group !== false);
  return count.length;
}

function applySearchString(searchString: string, todoTxtObjects: Record<string, any[]>): Record<string, any[]> {
  const filteredTodoTxtObjects = todoTxtObjects.filter(object => object && object.string && object.string.toLowerCase().includes(searchString.toLowerCase()));
  return filteredTodoTxtObjects;
}

function sortGroups(groupedTodoTxtObjects: Record<string, any[]>): Record<string, any[]> {
  if (!groupedTodoTxtObjects) {
    throw new Error('No grouped todo.txt objects found');
  }

  const invertGroupSorting = store.get('invertGroupSorting');
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

export { countTodoObjects, sortGroups, sortTodoTxtObjects, applySearchString }