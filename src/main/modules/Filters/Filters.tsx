function applyFilters(todoObjects: TodoObject[], filters: Filters | null): TodoObject[] {
  return todoObjects.map((todoObject: TodoObject) => {
    const isVisible = Object.entries(filters || {}).every(([key, filterArray]: [string, Filter[]]) => {
      if (filterArray.length === 0) {
        return true;
      }

      const attributeValues: any = ['due', 't'].includes(key) ? todoObject[key as keyof TodoObject] : todoObject[key as keyof TodoObject];

      return filterArray.every(({ value, exclude }: Filter) => {
        if (
          attributeValues === undefined ||
          attributeValues === null ||
          (Array.isArray(attributeValues) && attributeValues.length === 0)
        ) {
          return exclude;
        }

        const hasMatchingValue = attributeValues.includes(value);
        return exclude ? !hasMatchingValue : hasMatchingValue;
      });
    });

    todoObject.visible = isVisible;

    return todoObject;
  });
}

export { applyFilters };