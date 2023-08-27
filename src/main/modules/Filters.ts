import { BrowserWindow } from 'electron';
import dayjs from 'dayjs';
import { TodoObject, Filters, Filter, Attributes, Attribute } from '../util';

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

        return exclude ? !hasMatchingValue : hasMatchingValue;
      });
    });
  });
}

function createAttributesObject(todoObjects: TodoObject[]): Attributes {
  const incrementCount = function(countObject: { [key: string]: number }, key: any | null): void {
    if (key !== null) {
      countObject[key] = (countObject[key] || 0) + 1;
    }
  };

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

  todoObjects.forEach((todoObject: TodoObject) => {
    Object.keys(attributes).forEach((key) => {
      const value = ['due', 't'].includes(key) ? todoObject[key as keyof TodoObject] : todoObject[key as keyof TodoObject];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (element !== null) {
            incrementCount(attributes[key], element as keyof Attribute);
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
