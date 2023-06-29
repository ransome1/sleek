import { todoTxtObjects } from './TodoTxtObjects';
import { writeTodoTxtObjectToFile } from './WriteToFile';
import { Item } from 'jsTodoTxt';

async function changeCompleteState(id: number, state: boolean): Promise<void> {
  const todosAsFlatArray = Object.values(todoTxtObjects).flat();
  const lineNumber = parseInt(id.toString(), 10);
  const todoObject = todosAsFlatArray.find((item) => item.id === lineNumber);

  if (todoObject) {
    try {
      todoObject.complete = state;
      todoObject.completed = state ? new Date() : null;

      const todoTxtObject = new Item(todoObject.string);
      todoTxtObject.setPriority(todoObject.priority);
      todoTxtObject.setCreated(todoObject.created || new Date());
      todoTxtObject.setComplete(todoObject.complete);
      todoTxtObject.setCompleted(todoObject.completed);

      await writeTodoTxtObjectToFile(lineNumber, todoTxtObject.toString());
    } catch (error) {
      console.error(error);
    }
  }
}

export { changeCompleteState };
