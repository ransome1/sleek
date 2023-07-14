import { mainWindow } from '../main';
import filterStorage from '../config';

function applyFilters(todoObjects, filters) {
  if (filters && Object.keys(filters).length > 0) {
    return todoObjects.filter((todo) => {
      return Object.entries(filters).every(([key, filterArray]) => {
        if (Array.isArray(filterArray) && filterArray.length === 0) {
          return true;
        }

        const todoValues = todo[key];

        return filterArray.some(({ value, exclude }) => {
          if (todoValues === undefined || todoValues === null || (Array.isArray(todoValues) && todoValues.length === 0)) {
            return exclude;
          }

          const hasMatchingValue = todoValues.includes(value);
          return exclude ? !hasMatchingValue : hasMatchingValue;
        });
      });
    });
  }
  return todoObjects;
}


function createAttributesObject(todoObjects) {
  const attributes = {
    projects: {},
    contexts: {},
    due: {},
    t: {},
    rec: {},
    tags: {},
    pm: {},
  };

  todoObjects.forEach((item) => {
    Object.keys(attributes).forEach((key) => {
      const value = item[key];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          if (element !== null) {
            attributes[key][element] = (attributes[key][element] || 0) + 1;
          }
        });
      } else {
        incrementCount(attributes[key], value);
      }
    });
  });
  return attributes;
}

function incrementCount(countObject, key) {
  if (key !== null) {
    countObject[key] = (countObject[key] || 0) + 1;
  }
}


export { createAttributesObject, applyFilters };
