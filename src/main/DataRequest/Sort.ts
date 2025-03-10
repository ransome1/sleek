import { SettingsStore } from '../Stores';

const compareValues = (a: any, b: any, invert: boolean): number => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  const numA = typeof a === 'string' && !isNaN(Number(a)) ? Number(a) : a;
  const numB = typeof b === 'string' && !isNaN(Number(b)) ? Number(b) : b;

  if (typeof numA === 'number' && typeof numB === 'number') {
    return invert ? numB - numA : numA - numB;
  }

  const strA = String(a);
  const strB = String(b);

  return invert ? strB.localeCompare(strA) : strA.localeCompare(strB);
};

const sortTodoObjects = (a: TodoObject, b: TodoObject, sorting: Sorting[]): number => {
  const sortCompletedLast = SettingsStore.get('sortCompletedLast');

  if (sortCompletedLast) {
    if (a.complete && !b.complete) return 1;
    if (!a.complete && b.complete) return -1;
  }

  for (const { value, invert } of sorting) {
    const compareResult = compareValues(a[value], b[value], invert);
    if (compareResult !== 0) {
      return compareResult;
    }
  }
  return 0;
};

export { sortTodoObjects };
