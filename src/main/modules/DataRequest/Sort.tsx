import { config } from '../../config';

const compareValues = (a: any, b: any, invert: boolean): number => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  const strA = String(a);
  const strB = String(b);

  return invert ? strB.localeCompare(strA) : strA.localeCompare(strB);
};

const sortTodoObjects = (a: TodoObject, b: TodoObject, sorting: Sorting[]): number => {
  const sortCompletedLast = config.get('sortCompletedLast');

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
