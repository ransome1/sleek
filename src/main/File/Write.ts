import fs from "fs";
import path from "path";
import { Item } from "jstodotxt";
import { linesInFile } from "../DataRequest/CreateTodoObjects";
import { getActiveFile } from "./Active";
import { SettingsStore } from "../Stores";
import { replaceSpeakingDatesWithAbsoluteDates } from "../Date";
import { lineBreakPlaceholder } from "../Shared";

/**
 * Safely writes content to a file using atomic operations:
 * 1. Write to temporary file
 * 2. Verify temporary file was created
 * 3. Create backup of original file
 * 4. Rename (atomic operation on most filesystems)
 * 5. Clean up backup on success
 *
 * Ensures data integrity if process crashes mid-write.
 *
 * Use this for critical operations where data loss is unacceptable:
 * - Archiving (moves data between files)
 * - Any modification of existing todo.txt files
 *
 * @param string Content to write
 * @param filePath Path to target file
 * @throws Error if write operation fails (original file remains unchanged)
 */
const writeToFile = (string: string, filePath: string): void => {
  const tempFilePath = `${filePath}.tmp`;
  const backupFilePath = `${filePath}.bak`;

  try {
    if (process.mas) {
      // MAS: Direct write without temp files (less safe but required by sandbox)
      fs.writeFileSync(filePath, string + "\n", "utf-8");
    } else {
      // Step 1: Write to temporary file
      fs.writeFileSync(tempFilePath, string + "\n", "utf-8");

      // Step 2: Verify temporary file exists and is readable
      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`Failed to create temporary file: ${tempFilePath}`);
      }

      // Step 3: Create backup of original file if it exists
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupFilePath);
      }

      // Step 4: Atomically replace original file with temporary file
      fs.renameSync(tempFilePath, filePath);

      // Step 5: Clean up backup on success
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
      }
    }
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
    }
    throw new Error(
      `Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const removeLineFromFile = (lineNumber: number) => {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("No active file found");
  } else if (lineNumber >= 0) {
    linesInFile.splice(lineNumber, 1);
    writeToFile(linesInFile.join("\n"), activeFile.todoFilePath);
  }
};

const writeSingleTodoToFile = (
  lineNumber: number,
  content: string,
  isEditMode: boolean,
) => {
  const activeFile: FileObject | null = getActiveFile();
  if (!activeFile) {
    throw new Error("No active file found");
  } else if (!content) {
    throw new Error("No content passed");
  }

  let linesToAdd;

  if (SettingsStore.get("bulkTodoCreation") && !isEditMode && lineNumber < 0) {
    linesToAdd = content.replaceAll(lineBreakPlaceholder, "\n");
  } else {
    linesToAdd = content.replaceAll(/\n/g, lineBreakPlaceholder);
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
};

export { writeSingleTodoToFile, removeLineFromFile, writeToFile };
