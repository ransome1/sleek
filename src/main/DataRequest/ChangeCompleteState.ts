import { Item } from "jstodotxt";
import { createRecurringTodo } from "./CreateRecurringTodo";
import restorePreviousPriority from "./RestorePreviousPriority";

function changeCompleteState(string: string, state: boolean): string {
  // eslint-disable-next-line no-control-regex
  const content = string.replaceAll(/[\x10\r\n]/g, " [LB] ");

  // todo: use createTodoObject() instead
  const JsTodoTxtObject = new Item(content);

  JsTodoTxtObject.setComplete(state);

  if (state) {
    const recurrence = JsTodoTxtObject?.extensions().find(
      (item) => item.key === "rec",
    );

    if (recurrence?.value) {
      createRecurringTodo(content, recurrence.value);
    }

    JsTodoTxtObject.setCreated(
      JsTodoTxtObject.created() ? JsTodoTxtObject.created() : new Date(),
    );

    JsTodoTxtObject.setCompleted(new Date());

    const currentPriority = JsTodoTxtObject.priority();
    if (currentPriority) {
      JsTodoTxtObject.setPriority(null);
      JsTodoTxtObject.setExtension("pri", currentPriority);
    }
  } else {
    JsTodoTxtObject.setCompleted(null);
    restorePreviousPriority(JsTodoTxtObject);
  }

  return JsTodoTxtObject.toString().replaceAll(" [LB] ", "\n");
}

export { changeCompleteState };
