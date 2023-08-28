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

function incrementCount(countObject: { [key: string]: number }, key: any | null): void {
  if (key !== null) {
    countObject[key] = (countObject[key] || 0) + 1;
  }
}

function updateAttributes(attributes: Attributes, todoObjects: TodoObject[], reset: boolean): Attributes {
  Object.keys(attributes).forEach((key) => {

    if (reset) {
      Object.keys(attributes[key]).forEach((attributeKey) => {
        attributes[key][attributeKey] = 0;
      });
    }    
     
    todoObjects.forEach((todoObject: TodoObject) => {
      const value = todoObject[key as keyof TodoObject];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (element !== null) {
            const attributeKey = element as keyof Attribute;
            incrementCount(attributes[key], attributeKey);
          }
        });
      } else {
        if (value !== null) {
          incrementCount(attributes[key], value);
        }
      }
    });
    attributes[key] = Object.fromEntries(Object.entries(attributes[key]).sort(([a], [b]) => a.localeCompare(b)));
  });

  return attributes;
}

export { updateAttributes, applyFilters };
