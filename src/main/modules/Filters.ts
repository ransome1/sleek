import { mainWindow } from '../main';

function createFiltersObject(todoObjects) {
  const filters = {
    projects: {},
    contexts: {},
    due: {},
    t: {},
    rec: {},
    tag: {},
    pm: {},
  };

  Object.values(todoObjects).forEach((items: TodoTxtObject[]) => {
    items.forEach((item: TodoTxtObject) => {
      const { projects, contexts, due, t, rec, tags } = item;

      if (Array.isArray(projects)) {
        projects.forEach((project) => {
          if (project !== null) {
            filters.projects[project] = (filters.projects[project] || 0) + 1;
          }
        });
      }

      if (Array.isArray(contexts)) {
        contexts.forEach((context) => {
          if (context !== null) {
            filters.contexts[context] = (filters.contexts[context] || 0) + 1;
          }
        });
      }

      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (tag !== null) {
            filters.tags[tag] = (filters.tags[tag] || 0) + 1;
          }
        });
      }

      incrementCount(filters.due, due);
      incrementCount(filters.t, t);
      incrementCount(filters.rec, rec);
    });
  });

  return filters;
}

function incrementCount(countObject, key) {
  if (key !== null) {
    countObject[key] = (countObject[key] || 0) + 1;
  }
}

export { createFiltersObject };
