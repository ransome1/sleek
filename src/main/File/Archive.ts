import { getActiveFile } from "./Active";
import { readFileContent } from "./File";
import { writeToFile } from "./Write";
import { mainWindow } from "../index";

function handleRequestArchive(): void {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("Todo file is not defined");
  }
  mainWindow!.webContents.send(
    "triggerArchiving",
    Boolean(activeFile?.doneFilePath),
  );
}

function readFilteredFileContent(
  filePath: string,
  bookmark: string | null,
  complete: boolean,
): string {
  const filterStrings = (fileContent: string, complete: boolean): string => {
    const arrayOfStrings = fileContent.split("\n");
    const filteredArrayOfStrings = arrayOfStrings.filter((string) => {
      return (
        (complete && string.startsWith("x ")) ||
        (!complete && !string.startsWith("x "))
      );
    });
    return filteredArrayOfStrings.join("\n");
  };
  const fileContent: string | Error = readFileContent(filePath, bookmark);
  if (typeof fileContent === "string") {
    return filterStrings(fileContent, complete);
  } else {
    return "";
  }
}

function archiveTodos(): string {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("Todo file is not defined");
  }

  if (activeFile.doneFilePath === null) {
    return "Archiving file is not defined";
  }

  const completedTodos: string = readFilteredFileContent(
    activeFile.todoFilePath,
    activeFile.todoFileBookmark,
    true,
  );

  if (!completedTodos) {
    return "No completed todos found";
  }

  const uncompletedTodos: string = readFilteredFileContent(
    activeFile.todoFilePath,
    activeFile.todoFileBookmark,
    false,
  );

  const todosFromDoneFile: string | Error = readFileContent(
    activeFile.doneFilePath,
  );

  // Only write a new line when file is not empty and does not already end with a new line
  const separator =
    todosFromDoneFile.toString().endsWith("\n") ||
    todosFromDoneFile.toString() === ""
      ? ""
      : "\n";
  const contentForDoneFile =
    todosFromDoneFile.length > 1
      ? todosFromDoneFile + separator + completedTodos
      : completedTodos;

  writeToFile(contentForDoneFile, activeFile.doneFilePath);

  writeToFile(uncompletedTodos, activeFile.todoFilePath);

  return "Successfully archived";
}

export { archiveTodos, handleRequestArchive };
