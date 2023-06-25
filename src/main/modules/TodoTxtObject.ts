import { todoTxtObjects, lines } from './TodoTxtObjects';
import { Item } from 'jsTodoTxt';
import { activeFile } from '../util';
import fs from 'fs/promises';

function changeCompleteState(id, state) {
  const todosAsFlatArray = Object.values(todoTxtObjects).flat();
  const lineNumber = parseInt(id);
  const todo = todosAsFlatArray.find(item => item.id === lineNumber);

  if (todo) {
    todo.complete = state;
    state ? (todo.completed = new Date()) : (todo.completed = null);
    createTodoTxtObject(todo, lineNumber);
  }
}

function createTodoTxtObject(todoObject, lineNumber) {
  const todoTxtObject = new Item(todoObject.body);
  todoTxtObject.setPriority(todoObject.priority);
  todoTxtObject.setCreated(todoObject.created ? todoObject.created : new Date());
  todoTxtObject.setComplete(todoObject.complete);
  todoTxtObject.setCompleted(todoObject.completed);
  writeTodoTxtObjectToFile(todoTxtObject, lineNumber);
}

async function writeTodoTxtObjectToFile(todoTxtObject, lineNumber) {
  if (lineNumber >= 0 && lineNumber < lines.length) {
    lines[lineNumber] = todoTxtObject.toString();
  } else {
    throw new Error('Invalid line number');
  }

  const modifiedContent = lines.join('\n');

  try {
    await fs.writeFile(activeFile.path, modifiedContent, 'utf8');
    console.log(`Line ${lineNumber + 1} overwritten successfully.`);
  } catch (error) {
    console.error(error);
  }
}

export default changeCompleteState;
