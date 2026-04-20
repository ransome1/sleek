import { getActiveFile } from "./Active";
import { readFileContent } from "./File";
import { writeToFile } from "./Write";
import { mainWindow } from "../index";
import { File } from "@sleek-types";

const COMPLETION_MARKER = "x ";

function checkArchiveReadiness(): void {
  const activeFile: File | null = getActiveFile();
  if (!activeFile) {
    throw new Error("Todo file is not defined");
  }
  mainWindow!.webContents.send(
    "triggerArchiving",
    Boolean(activeFile?.doneFilePath),
  );
}

function isCompleted(line: string): boolean {
  return line.startsWith(COMPLETION_MARKER);
}

function filterByCompletion(content: string, complete: boolean): string {
  return content
    .split("\n")
    .filter((line) => (complete ? isCompleted(line) : !isCompleted(line)))
    .join("\n");
}

function archiveTodos(): string {
  const activeFile = getActiveFile();
  if (!activeFile) {
    throw new Error("Todo file is not defined");
  }

  if (!activeFile.doneFilePath) {
    throw new Error("Archiving file is not defined");
  }

  // Read todo file only once
  const todoContent: string = readFileContent(
    activeFile.todoFilePath,
    activeFile.todoFileBookmark,
  );

  // Split into completed and uncompleted in memory
  const completedTodos = filterByCompletion(todoContent, true);
  const uncompletedTodos = filterByCompletion(todoContent, false);

  if (!completedTodos.trim()) {
    throw new Error("No completed todos found");
  }

  const todosFromDoneFile: string = readFileContent(
    activeFile.doneFilePath,
    activeFile.doneFileBookmark,
  );

  // Only write a new line when file is not empty and does not already end with a new line
  const trim = todosFromDoneFile.trim();
  const separator = trim ? "\n" : "";
  const contentForDoneFile = trim
    ? `${trim}${separator}${completedTodos}`
    : completedTodos;

  // Use safe write with atomic operations and backup
  writeToFile(contentForDoneFile, activeFile.doneFilePath);
  writeToFile(uncompletedTodos, activeFile.todoFilePath);

  return "Successfully archived";
}

export { archiveTodos, checkArchiveReadiness };