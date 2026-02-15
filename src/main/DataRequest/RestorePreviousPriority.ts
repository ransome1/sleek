import { Item } from "jstodotxt";

function restorePreviousPriority(JsTodoTxtObject: Item) {
  if (!JsTodoTxtObject.extensions) return;
  const previousPriorityIndex: number = JsTodoTxtObject.extensions().findIndex(
    (extension: { key: string; value: string }) => extension.key === "pri",
  );
  const previousPriorityString: string =
    JsTodoTxtObject.extensions()[previousPriorityIndex]?.value;
  JsTodoTxtObject.setPriority(previousPriorityString);
  JsTodoTxtObject.removeExtension("pri", previousPriorityString);
}

export default restorePreviousPriority;
