import { todoTxtObjects, lines } from './TodoTxtObjects';
import { Item } from 'jsTodoTxt';
import { activeFile } from '../util';
import fs from 'fs/promises';

function changeCompleteState(id: number, state: boolean): void {
  const todosAsFlatArray = Object.values(todoTxtObjects).flat();
  const lineNumber = parseInt(id.toString(), 10);
  const todo = todosAsFlatArray.find((item) => item.id === lineNumber);

  if (todo) {
    todo.complete = state;
    state ? (todo.completed = new Date()) : (todo.completed = null);
    createTodoTxtObject(todo, lineNumber);
  }
}

function createTodoTxtObject(todoObject: any, lineNumber: number): void {
  const todoTxtObject = new Item(todoObject.body);
  todoTxtObject.setPriority(todoObject.priority);
  todoTxtObject.setCreated(todoObject.created ? todoObject.created : new Date());
  todoTxtObject.setComplete(todoObject.complete);
  todoTxtObject.setCompleted(todoObject.completed);
  writeTodoTxtObjectToFile(todoTxtObject, lineNumber);
}

async function writeTodoTxtObjectToFile(todoTxtObject: any, lineNumber: number): Promise<void> {
  if (lineNumber >= 0 && lineNumber < lines.length) {
    lines[lineNumber] = todoTxtObject.toString();
  } else {
    throw new Error('Invalid line number');
  }

  const modifiedContent = lines.join('\n');

  try {
    const activeFilePath = activeFile()?.path || '';
    await fs.writeFile(activeFilePath, modifiedContent, 'utf8');
    console.log(`Line ${lineNumber + 1} overwritten successfully.`);
  } catch (error) {
    console.error(error);
  }
}

export { changeCompleteState, createTodoTxtObject, writeTodoTxtObjectToFile };
