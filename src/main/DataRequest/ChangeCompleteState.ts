import { createRecurringTodo } from './CreateRecurringTodo'
import restorePreviousPriority from './RestorePreviousPriority'
import { createItem, itemToString } from './CreateTodoObjects'

function changeCompleteState(string: string, state: boolean): string {
  const JsTodoTxtObject = createItem(string)

  JsTodoTxtObject.setComplete(state)

  if (state) {
    JsTodoTxtObject.setCreated(JsTodoTxtObject.created() ? JsTodoTxtObject.created() : new Date())
    JsTodoTxtObject.setCompleted(new Date())

    const recurrence = JsTodoTxtObject?.extensions().find((item) => item.key === 'rec')
    if (recurrence?.value) {
      createRecurringTodo(JsTodoTxtObject.toString(), recurrence.value)
    }

    const currentPriority = JsTodoTxtObject.priority()
    if (currentPriority) {
      JsTodoTxtObject.setPriority(null)
      JsTodoTxtObject.setExtension('pri', currentPriority)
    }
  } else {
    JsTodoTxtObject.setCompleted(null)
    restorePreviousPriority(JsTodoTxtObject)
  }

  return itemToString(JsTodoTxtObject)
}

export { changeCompleteState }
