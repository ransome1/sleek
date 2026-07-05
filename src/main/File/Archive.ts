import { getActiveFile } from "./Active";
import { readFileContent } from "./File";
import { writeToFile } from "./Write";
import { mainWindow } from "../index";
import { SettingsStore } from "../Stores";
import { TranslateMain } from "../I18n";
import { File } from "@sleek-types";

const COMPLETION_MARKER = "x ";

const t = (key: Parameters<typeof TranslateMain>[0]) =>
  TranslateMain(key, SettingsStore.get("language"));

function checkArchiveReadiness(): void {
  const activeFile: File | null = getActiveFile();
  if (!activeFile) {
    throw new Error(t("archive.error.todoFileNotDefined"));
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
    throw new Error(t("archive.error.todoFileNotDefined"));
  }

  if (!activeFile.doneFilePath) {
    throw new Error(t("archive.error.archivingFileNotDefined"));
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
    throw new Error(t("archive.error.noCompletedTodosFound"));
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

  return t("archive.success");
}

export { archiveTodos, checkArchiveReadiness };
