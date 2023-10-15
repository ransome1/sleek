import { Item } from 'jstodotxt';
import { createRecurringTodo } from './CreateRecurringTodo';
import restorePreviousPriority from './RestorePreviousPriority';
import { TodoObject } from '../../util';
import { configStorage } from '../../config';

async function changeCompleteState(todoString: string, state: boolean): Promise<string | null> {
  if (typeof state !== 'boolean') {
    throw new Error('State must be of type boolean');
  }

  const JsTodoTxtObject = new Item(todoString);
  JsTodoTxtObject.setComplete(state);

  if(state) {
    JsTodoTxtObject.setCreated(JsTodoTxtObject.created() ? JsTodoTxtObject.created() : new Date());
    JsTodoTxtObject.setCompleted(new Date());

    const currentPriority = JsTodoTxtObject.priority();
    if(currentPriority) {
      JsTodoTxtObject.setPriority(null)
      JsTodoTxtObject.setExtension('pri', currentPriority);
    }

  } else {
    JsTodoTxtObject.setCompleted(null);
    restorePreviousPriority(JsTodoTxtObject);
  }

  const recurrence = JsTodoTxtObject?.extensions().find((item) => item.key === 'rec');
  if (state && recurrence?.value) {
    try {
      const response = await createRecurringTodo(JsTodoTxtObject.toString(), recurrence.value);
      console.log('changeCompleteState.ts:', response);
    } catch (error) {
      console.error(error);
    }
  }

  const updatedTodoString = JsTodoTxtObject.toString();

  return Promise.resolve(updatedTodoString);
}

export { changeCompleteState };
