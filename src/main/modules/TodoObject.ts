import { todoObjects } from './TodoObjects';
import { Item } from 'jstodotxt';

type TodoObject = Record<string, any>;

function changeCompleteState(id: number, state: boolean): Item | null {
  if (typeof id !== 'number' || typeof state !== 'boolean') {
    throw new Error('Invalid parameters: ID and state must be of type number and boolean respectively');
  }

  const todosAsFlatArray: TodoObject[] = Object.values(todoObjects).flat();
  const todoObject: TodoObject | undefined = todosAsFlatArray.find((todo) => todo.id === id);

  if (todoObject) {
    const updatedTodoObject: Item = new Item(todoObject.string);
    updatedTodoObject.setComplete(state);
    updatedTodoObject.setCreated(updatedTodoObject.created() ?? new Date());

    if (state) {
      updatedTodoObject.setCompleted(new Date());
    } else {
      updatedTodoObject.setCompleted(null);
    }

    return updatedTodoObject;
  }

  return null;
}

export { changeCompleteState };
