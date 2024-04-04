import { config } from '../../config';

function sortAndGroupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[], settings: Settings): TodoObject[] {
  let rows;
  const fileSorting: boolean = config.get('fileSorting');
  const showHidden: boolean = config.get('showHidden');

  function compareValues(a: any, b: any, invert: boolean): number {
    const comparison = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
    return invert ? -comparison : comparison;
  }

  function applySorting(a: TodoObject, b: TodoObject, sorting): number {
    for (const { value, invert } of sorting) {
      const compareResult = compareValues(a[value], b[value], invert);
      if (compareResult !== 0) {
        return compareResult;
      }
    }
    return 0;
  }

  function groupTodoObjectsByKey(todoObjects, attributeKey) {
    const grouped = {};
    for (const todoObject of todoObjects) {
      const groupKey = todoObject[attributeKey] || '';
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          title: groupKey,
          todoObjects: [],
          visible: false
        };
      }
      rows++;
      todoObject.row = rows;
      grouped[groupKey].todoObjects.push(todoObject);
      grouped[groupKey].visible = grouped[groupKey].todoObjects.some(todoObject => {
        return !todoObject.hidden || (showHidden && todoObject.hidden);
      });
    }
    return Object.values(grouped);
  }

  function sortTodoObjects(todoObjects: TodoObject[], sorting): any {
    const { value } = sorting[0];
    const grouped = groupTodoObjectsByKey(todoObjects, value);
    return grouped;
  }

  if(fileSorting) {
    return [{
      title: null,
      todoObjects: todoObjects,
      visible: true
    }]
  }
  rows = 0;
  const sortedTodoObjects = [...todoObjects].sort((a, b) => applySorting(a, b, sorting));
  return sortTodoObjects(sortedTodoObjects, sorting);
}

export { sortAndGroupTodoObjects };