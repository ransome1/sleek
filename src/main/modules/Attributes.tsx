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

function incrementCount(countObject: any, key: any | null, notify: boolean, visible: boolean): void {
  if(key) {
    let previousCount: number = parseInt(countObject[key]?.count) || 0;
    countObject[key] = {
      count: previousCount + 1,
      notify: notify,
      visible: visible,
    }
  }
}

function updateAttributes(todoObjects: TodoObject[], sorting: Sorting[], reset: boolean) {
  Object.keys(attributes).forEach((key) => {
    Object.keys(attributes[key]).forEach((attributeKey) => {
      (reset) ? attributes[key] = {} : attributes[key][attributeKey].count = 0
    });
    todoObjects.forEach((todoObject: TodoObject) => {
      const value = todoObject[key as keyof TodoObject];
      const notify: boolean = (key === 'due') ? !!todoObject?.notify : false;
      const visible: boolean = todoObject.visible;

      if(Array.isArray(value)) {
        value.forEach((element) => {
          if(element !== null) {
            const attributeKey = element as keyof Attribute;
            incrementCount(attributes[key], attributeKey, notify, visible);
          }
        });
      } else {
        if(value !== null) {
          incrementCount(attributes[key], value, notify, visible);
        }
      }
    });
    attributes[key] = Object.fromEntries(Object.entries(attributes[key]).sort(([a], [b]) => a.localeCompare(b)));
  });
  attributes = Object.fromEntries(sorting.map((item) => [item.value, attributes[item.value]]));
}

export { attributes, updateAttributes };
