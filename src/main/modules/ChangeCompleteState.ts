import { Item } from 'jstodotxt';
import { createRecurringTodo } from './CreateRecurringTodo';

type TodoObject = Record<string, any>;

async function changeCompleteState(string: string, state: boolean): Promise<string | null> {
  if (typeof state !== 'boolean') {
    throw new Error('Invalid parameters: State must be of type boolean');
  }

  const todoObject = new Item(string);

  todoObject.setComplete(state);
  todoObject.setCreated(todoObject.created() ?? new Date());

  if (state) {
    todoObject.setCompleted(new Date());
  } else {
    todoObject.setCompleted(null);
  }

  const recurrence = todoObject?.extensions().find(item => item.key === 'rec');
  if(state && recurrence?.value) {
    console.log(todoObject.toString())
    await createRecurringTodo(todoObject.toString(), recurrence.value).then(function(response) {
      console.log('changeCompleteState.ts:', response)
    }).catch((error) => {
      console.error(error)
    });
  }

  const todoString = todoObject.toString();

  return Promise.resolve(todoString);
}

export { changeCompleteState };