import { Attributes, Attribute, TodoObject, Sorting } from '../util';

let attributes: Attributes = {
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

function incrementCount(countObject: { [key: string]: number }, key: any | null): void {
  if (key !== null) {
    countObject[key] = (countObject[key] || 0) + 1;
  }
}

function updateAttributes(todoObjects: TodoObject[], sorting: Sorting[], reset: boolean) {
  Object.keys(attributes).forEach((key) => {
    Object.keys(attributes[key]).forEach((attributeKey) => {
      (reset) ? attributes[key] = {} : attributes[key][attributeKey] = 0
    });
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
  attributes = Object.fromEntries(sorting.map((item) => [item.value, attributes[item.value]]));
}

export { attributes, updateAttributes };
