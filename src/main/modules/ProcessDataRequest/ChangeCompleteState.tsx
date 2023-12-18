import { Item } from 'jstodotxt';
import { createRecurringTodo } from './CreateRecurringTodo';
import restorePreviousPriority from './RestorePreviousPriority';

async function changeCompleteState(todoString: string, state: boolean): Promise<string> {
  const JsTodoTxtObject = new Item(todoString);
  JsTodoTxtObject.setComplete(state);

  if(state) {
    JsTodoTxtObject.setCreated(JsTodoTxtObject.created() ? JsTodoTxtObject.created() : new Date());
    JsTodoTxtObject.setCompleted(new Date());

    const recurrence = JsTodoTxtObject?.extensions().find((item) => item.key === 'rec');
    if(recurrence?.value) {
      await createRecurringTodo(JsTodoTxtObject.toString(), recurrence.value);
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

  return JsTodoTxtObject.toString();
}

export { changeCompleteState };
