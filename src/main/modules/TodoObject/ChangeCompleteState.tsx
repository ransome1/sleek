import { Item } from 'jstodotxt';
import { createRecurringTodo } from './CreateRecurringTodo';
import restorePreviousPriority from './RestorePreviousPriority';

async function changeCompleteState(todoString: string, state: boolean): Promise<string | null> {
  const JsTodoTxtObject = new Item(todoString);
  JsTodoTxtObject.setComplete(state);

  if(state) {
    JsTodoTxtObject.setCreated(JsTodoTxtObject.created() ? JsTodoTxtObject.created() : new Date());
    JsTodoTxtObject.setCompleted(new Date());

    const recurrence = JsTodoTxtObject?.extensions().find((item) => item.key === 'rec');
    if (recurrence?.value) {
      try {
        const response = await createRecurringTodo(JsTodoTxtObject.toString(), recurrence.value);
        console.log('changeCompleteState.ts:', response);
      } catch (error: any) {
        console.error(error);
      }
    }

    const currentPriority = JsTodoTxtObject.priority();
    if(currentPriority) {
      JsTodoTxtObject.setPriority(null)
      JsTodoTxtObject.setExtension('pri', currentPriority);
    }

  } else {
    JsTodoTxtObject.setCompleted(null);
    restorePreviousPriority(JsTodoTxtObject);
  }

  const updatedTodoString = JsTodoTxtObject.toString();

  return Promise.resolve(updatedTodoString);
}

export { changeCompleteState };