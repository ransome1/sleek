import { IpcMainEvent } from "electron";
import { getActiveFile } from "./File/Active.js";
import { renameAttributeValue, deleteAttributeValue } from "./DataRequest/AttributeModifier.js";
import { linesInFile } from "./DataRequest/CreateTodoObjects.js";
import { writeToFile } from "./File/Write.js";
import { HandleError } from "./Shared.js";


export function handleRenameFilterValue(
  event: IpcMainEvent,
  attrType: string,
  oldValue: string,
  newValue: string
): void {
  try {
    
    const activeFile = getActiveFile();
    if (!activeFile) throw new Error("No active file");

    
    const { count } = renameAttributeValue(linesInFile, attrType, oldValue, newValue);
    

    if (count === 0) {
      event.reply("responseFromMainProcess", `No todos found with "${oldValue}"`);
      return;
    }

    writeToFile(linesInFile.join("\n"), activeFile.todoFilePath);
    event.reply("responseFromMainProcess", `Renamed "${oldValue}" to "${newValue}" in ${count} todos`);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}

export function handleDeleteFilterValue(
  event: IpcMainEvent,
  attrType: string,
  valueToDelete: string
): void {
  try {
    const activeFile = getActiveFile();
    if (!activeFile) throw new Error("No active file");

    const { count } = deleteAttributeValue(linesInFile, attrType, valueToDelete);

    if (count === 0) {
      event.reply("responseFromMainProcess", `No todos found with "${valueToDelete}"`);
      return;
    }

    writeToFile(linesInFile.join("\n"), activeFile.todoFilePath);
    event.reply("responseFromMainProcess", `Deleted "${valueToDelete}" from ${count} todos`);
  } catch (error) {
    if (error instanceof Error) HandleError(error);
  }
}