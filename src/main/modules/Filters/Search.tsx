import * as FilterLang from './FilterLang';
import { runQuery } from './FilterQuery';
import { createTodoObject } from '../DataRequest/CreateTodoObjects';

function applySearchString(searchString: string, todoObjects: TodoObject[]): TodoObject[] {
  try {
    const query = FilterLang.parse(searchString);
    return todoObjects.filter(todoObject => runQuery(todoObject, query));
  } catch (error) {
    const lowerSearchString = searchString.toLowerCase();
    return Object.values(todoObjects)
      .flat()
      .filter(todoObject => todoObject?.string?.toLowerCase().includes(lowerSearchString));
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