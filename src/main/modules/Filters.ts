import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';
import { TodoObject, Filters, Filter, Attributes } from '../util';

function applyFilters(todoObjects: TodoObject[], filters: Filters | null): TodoObject[] {
  if (filters && Object.keys(filters).length > 0) {
    return todoObjects.filter((todoObject: TodoObject) => {

      return Object.entries(filters).every(([key, filterArray]) => {
        
        if (filterArray?.length === 0) {
          return true;
        }

        const attributeValues: any = todoObject[key as keyof TodoObject];

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
    });
  }
  return todoObjects;
}

function createAttributesObject(todoObjects: TodoObject[]): Attributes {
  const incrementCount = function(countObject: { [key: string]: number }, key: string | null): void {
    if (key !== null) {
      countObject[key] = (countObject[key] || 0) + 1;
    }
  }  
  const attributes: Attributes = {
    priority: {},
    projects: {},
    contexts: {},
    due: {},
    t: {},
    rec: {},
    pm: {},
    created: {},
    completed: {},
  };

  todoObjects.forEach((item) => {
    Object.keys(attributes).forEach((key) => {

      const value = item[key as keyof TodoObject];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (element !== null) {
            attributes[key][element] = (attributes[key][element] || 0) + 1;
          }
        });
      } else {
        incrementCount(attributes[key], value);
      }
      attributes[key] = Object.fromEntries(Object.entries(attributes[key]).sort(([a], [b]) => a.localeCompare(b)));
    });
  });

  return attributes;
}

export { createAttributesObject, applyFilters };
