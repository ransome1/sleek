import { Item } from 'jstodotxt';
import { createRecurringTodo } from './CreateRecurringTodo';
import { TodoObject } from '../../util';
import { configStorage } from '../../config';

async function changeCompleteState(todoString: string, state: boolean): Promise<string | null> {
  if (typeof state !== 'boolean') {
    throw new Error('State must be of type boolean');
  }

  const todoObject = new Item(todoString);
  todoObject.setComplete(state);

  if(state) {
    todoObject.setCreated(todoObject.created() ? todoObject.created() : new Date());
    todoObject.setCompleted(new Date());

    const currentPriority = todoObject.priority();
    if(currentPriority) {
      todoObject.setPriority(null)
      todoObject.setExtension('pri', currentPriority);
    }

  } else {
    todoObject.setCompleted(null);

    const previousPriorityIndex = todoObject.extensions().findIndex((extension) => extension.key === 'pri');
    const previousPriorityString = todoObject.extensions()[previousPriorityIndex]?.value;
    if(previousPriorityString && previousPriorityString !== 'null') {
      todoObject.setPriority(previousPriorityString)
    }

  }

  const recurrence = todoObject?.extensions().find((item) => item.key === 'rec');
  if (state && recurrence?.value) {
    try {
      const response = await createRecurringTodo(todoObject.toString(), recurrence.value);
      console.log('changeCompleteState.ts:', response);
    } catch (error) {
      console.error(error);
    }
  }

  const updatedTodoString = todoObject.toString();

  return Promise.resolve(updatedTodoString);
}

export { changeCompleteState };
