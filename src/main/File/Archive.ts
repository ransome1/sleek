import { getActiveFile } from "./Active";
import { readFileContent } from "./File";
import { writeToFile } from "./Write";
import { mainWindow } from "../index";
import i18n from "../i18n";
import { File } from "@sleek-types";

const COMPLETION_MARKER = "x ";

function checkArchiveReadiness(): void {
  const activeFile: File | null = getActiveFile();
  if (!activeFile) {
    throw new Error(i18n.t("archive.error.todoFileNotDefined"));
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
  validateArchivingPrerequisites(activeFile);

  // Read todo file only once
  const todoContent: string = readFileContent(
    activeFile.todoFilePath,
    activeFile.todoFileBookmark,
  );

  // Split into completed and uncompleted in memory
  const completedTodos = filterByCompletion(todoContent, true);
  const uncompletedTodos = filterByCompletion(todoContent, false);

  if (!completedTodos.trim()) {
    throw new Error(i18n.t("archive.error.noCompletedTodosFound"));
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

  return i18n.t("archive.success");
}

function archiveSingleTodo(lineNumber: number): string {
  const activeFile = getActiveFile();
  validateArchivingPrerequisites(activeFile);

  // Read todo file
  const todoContent: string = readFileContent(
    activeFile.todoFilePath,
    activeFile.todoFileBookmark,
  );
  const todoLines = todoContent
    .split(/[\r\n]+/)
    .filter((line) => line.trim() !== "");

  // Read done file
  const todosFromDoneFile: string = readFileContent(
    activeFile.doneFilePath,
    activeFile.doneFileBookmark,
  );

  const lineToArchive = todoLines[lineNumber];

  // Only write a new line when file is not empty and does not already end with a new line
  const trim = todosFromDoneFile.trim();
  const separator = trim ? "\n" : "";
  const contentForDoneFile = trim
    ? `${trim}${separator}${lineToArchive}`
    : lineToArchive;
  writeToFile(contentForDoneFile, activeFile.doneFilePath);

  todoLines.splice(lineNumber, 1);
  writeToFile(todoLines.join("\n"), activeFile.todoFilePath);

  return i18n.t("archive.success");
}

function validateArchivingPrerequisites(
  activeFile: File | null,
): asserts activeFile is File & { doneFilePath: string } {
  if (!activeFile) {
    throw new Error(i18n.t("archive.error.todoFileNotDefined"));
  }

  if (!activeFile.doneFilePath) {
    throw new Error(i18n.t("archive.error.archivingFileNotDefined"));
  }
}

export { archiveTodos, archiveSingleTodo, checkArchiveReadiness };
