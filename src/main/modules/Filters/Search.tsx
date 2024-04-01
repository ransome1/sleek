import * as FilterLang from './FilterLang.js';
import { runQuery } from './FilterQuery';
import { createTodoObject } from '../ProcessDataRequest/CreateTodoObjects';

function applySearchString(searchString: string, todoObjects: TodoObject[]): TodoObject[] {
  try {
    const query = FilterLang.parse(searchString);
    return todoObjects.map(todoObject => {
      if(!todoObject.visible) return todoObject;
      todoObject.visible = runQuery(todoObject, query);
      return todoObject;
    });
  } catch (error) {
    const lowerSearchString = searchString.toLowerCase();
    return Object.values(todoObjects)
      .flat()
      .map(todoObject => {
        if(!todoObject.visible) return todoObject;
        todoObject.visible = todoObject?.string?.toLowerCase().includes(lowerSearchString) || false;
        return todoObject;
      }) as TodoObject[];
  }
}

function checkForSearchMatches(todoString: string, searchString: string) {
  try {
    const todoObject = createTodoObject(-1, todoString);
    const query = FilterLang.parse(searchString);
    return runQuery(todoObject, query);
  } catch (error) {
    return todoString.toLowerCase().includes(searchString);
  }
}

export { applySearchString, checkForSearchMatches};