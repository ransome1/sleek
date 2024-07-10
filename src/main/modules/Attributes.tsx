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

function incrementCount(countObject: any, key: any | null, notify: boolean): void {
  if(key) {
    let previousCount: number = parseInt(countObject[key]?.count) || 0;
    countObject[key] = {
      count: previousCount + 1,
      notify: notify,
    }
  }
}

function updateAttributes(todoObjects: TodoObject[], sorting: Sorting[], reset: boolean) {

  const attributeKeys = Object.keys(attributes) as AttributeKey[];

  for (const key of attributeKeys) {

    for (const attributeKey in attributes[key]) {
      (reset) ? attributes[key] = {} : attributes[key][attributeKey].count = 0
    };

    for (const todoObject of todoObjects) {
      const value = todoObject[key as keyof TodoObject];
      const notify: boolean = (key === 'due') ? !!todoObject?.notify : false;

      if(Array.isArray(value)) {
        for (const element of value) {
          if(element !== null) {
            const attributeKey = element as keyof Attribute;

            incrementCount(attributes[key], attributeKey, notify);
          }
        }
      } else {
        if(value !== null) {
          incrementCount(attributes[key], value, notify);
        }
      }
    }
    attributes[key] = Object.fromEntries(Object.entries(attributes[key]).sort(([a], [b]) => a.localeCompare(b)));
  }
}

export { attributes, updateAttributes };
