import { getActiveFile } from "../File/Active";
import { readFileContent } from "../File/File";
import { SettingsStore, FiltersStore } from "../Stores";
import { applySearchString } from "../Filters/Search";
import {
  applyAttributes,
  handleCompletedTodoObjects,
  handleTodoObjectsDates,
} from "../Filters/Filters";
import { updateAttributes, attributes } from "../Attributes";
import { createTodoObjects } from "./CreateTodoObjects";
import { sortTodoObjects } from "./Sort";
import { groupTodoObjects } from "./Group";
import {
  Filters,
  HeadersObject,
  RequestedData,
  Sorting,
  TodoObject,
} from "@sleek-types";

let searchString: string;
const headers: HeadersObject = {
  availableObjects: 0,
  completedObjects: 0,
  visibleObjects: 0,
};
let todoObjects: TodoObject[];

function dataRequest(passedSearchString: string = ""): RequestedData | null {
  searchString = passedSearchString;

  const activeFile = getActiveFile();
  if (!activeFile) {
    return {
  headers: {
    availableObjects: 0,
    completedObjects: 0,
    visibleObjects: 0
  },
  attributes: {
    priority: {}, due: {}, t: {}, contexts: {}, projects: {},
    rec: {}, pm: {}, hidden: {}, created: {}, completed: {}
  },
  filters: {
    priority: [], due: [], t: [], contexts: [], projects: [],
    rec: [], pm: [], hidden: [], created: [], completed: []
  },
  todoData: []
};
  }

  const fileContent = readFileContent(activeFile.todoFilePath);

  const sorting: Sorting[] = SettingsStore.get("sorting");
  const filters: Filters = FiltersStore.get("attributes") as Filters;
  const showHidden: boolean = SettingsStore.get("showHidden");
  const fileSorting = SettingsStore.get("fileSorting");

  todoObjects = createTodoObjects(fileContent);

  headers.availableObjects = todoObjects.length;

  todoObjects = handleTodoObjectsDates(todoObjects);

  // todo: should this be improved
  const completedTodoObjects: TodoObject[] = todoObjects.filter(
    (todoObject: TodoObject) => {
      return todoObject.complete;
    },
  );

  headers.completedObjects = completedTodoObjects.length;

  todoObjects = handleCompletedTodoObjects(todoObjects);

  updateAttributes(todoObjects, sorting, true);

  if (filters) todoObjects = applyAttributes(todoObjects, filters);

  if (searchString) todoObjects = applySearchString(searchString, todoObjects);

  updateAttributes(todoObjects, sorting, false);

  if (showHidden) {
    headers.visibleObjects = todoObjects.length;
  } else {
    const visibleObjects = todoObjects.filter(
      (todoObject) => !todoObject.hidden,
    );
    headers.visibleObjects = visibleObjects.length;
    todoObjects = visibleObjects;
  }

  let todoData;

  if (fileSorting) {
    todoData = [
      {
        title: null,
        todoObjects,
        visible: true,
      },
    ];
  } else {
    todoObjects.sort((a, b) => sortTodoObjects(a, b, sorting));
    todoData = groupTodoObjects(todoObjects, sorting[0].value);

    const sortCompletedLast = SettingsStore.get("sortCompletedLast");
    if (sortCompletedLast) {
      for (const group of todoData) {
        group.todoObjects.sort((a, b) => {
          if (a.complete && !b.complete) return 1;
          if (!a.complete && b.complete) return -1;
          return 0;
        });
      }
    }
  }

  const requestedData: RequestedData = {
    todoData,
    attributes,
    headers,
    filters,
  };

  return requestedData;
}

export { dataRequest, searchString };
