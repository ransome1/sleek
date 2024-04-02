function sortAndGroupTodoObjects(todoObjects: TodoObject[], sorting: Sorting[]): TodoObject[] {
    function compareValues(a: any, b: any, invert: boolean): number {
      const comparison = String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
      return invert ? -comparison : comparison;
    }

    function applySorting(a: any, b: any): number {
      for (const { value, invert } of sorting) {
        const compareResult = compareValues(a[value], b[value], invert);
        if (compareResult !== 0) {
          return compareResult;
        }
      }
      return 0;
    }

    function groupObjectsByKey(todoObjects, attributeKey) {
      const grouped = {};
      for (const todoObject of todoObjects) {
        const groupKey = todoObject[attributeKey] || '';
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            title: groupKey,
            visible: false,
            todoObjects: []
          };
        }
        if(todoObject.visible) grouped[groupKey].visible = true;
        grouped[groupKey].todoObjects.push(todoObject);
      }
      return Object.values(grouped);
    }

    function sortAndGroupObjects(objects: any[]): any {
      const { value } = sorting[0];
      const grouped = groupObjectsByKey(objects, value);
      return grouped;
    }

    const sortedTodoObjects = Object.values(todoObjects).sort(applySorting);

    return sortAndGroupObjects(sortedTodoObjects);
}

export { sortAndGroupTodoObjects };