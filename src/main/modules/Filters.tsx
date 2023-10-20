import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';
import { TodoObject, Filters, Filter } from '../util';

function applyFilters(todoObjects: TodoObject[], filters: Filters | null): TodoObject[] {
  if (!filters || Object.keys(filters).length === 0) {
    return todoObjects;
  }

  return todoObjects.filter((todoObject: TodoObject) => {
    return Object.entries(filters).every(([key, filterArray]) => {
      if (!filterArray?.length) {
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

        console.log(hasMatchingValue)

        return exclude ? !hasMatchingValue : hasMatchingValue;
      });
    });
  });
}

export { applyFilters };
