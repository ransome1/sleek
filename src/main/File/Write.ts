import fs from "fs";
import { Item } from "jstodotxt";
import { linesInFile } from "../DataRequest/CreateTodoObjects";
import { getActiveFile } from "./Active";
import { SettingsStore } from "../Stores";
import { replaceSpeakingDatesWithAbsoluteDates } from "../Date";

function writeToFile(string: string, filePath: string) {
  fs.writeFileSync(filePath, string + "\n", "utf-8");
}

function removeLineFromFile(lineNumber: number) {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("No active file found");
  } else if (lineNumber >= 0) {
    linesInFile.splice(lineNumber, 1);
    writeToFile(linesInFile.join("\n"), activeFile.todoFilePath);
  }
}

function prepareContentForWriting(lineNumber: number, string: string) {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("No active file found");
  } else if (!string) {
    throw new Error("No content passed");
  }

  let linesToAdd;

  if (SettingsStore.get("bulkTodoCreation")) {
    linesToAdd = string.replaceAll(String.fromCharCode(16), "\n");
  } else {
    linesToAdd = string.replaceAll(/\n/g, String.fromCharCode(16));
  }

  if (SettingsStore.get("convertRelativeToAbsoluteDates")) {
    linesToAdd = replaceSpeakingDatesWithAbsoluteDates(linesToAdd);
  }

  linesToAdd = linesToAdd.split("\n");

  if (lineNumber >= 0) {
    linesInFile[lineNumber] = linesToAdd.join("\n");
  } else {
    for (let i = 0; i < linesToAdd.length; i++) {
      const JsTodoTxtObject = new Item(linesToAdd[i]);
      if (
        SettingsStore.get("appendCreationDate") &&
        !JsTodoTxtObject.created()
      ) {
        JsTodoTxtObject.setCreated(new Date());
      }
      linesInFile.push(JsTodoTxtObject.toString());
    }
  }

  writeToFile(linesInFile.join("\n"), activeFile.todoFilePath);
}

export { prepareContentForWriting, removeLineFromFile, writeToFile };
