import { app } from 'electron';
import fs from 'fs/promises';
import { Item } from 'jstodotxt';
import { lines } from '../TodoObject/CreateTodoObjects';
import { getActiveFile } from './Active';
import { configStorage } from '../../config';
import { File } from '../../util';
import { replaceSpeakingDatesWithAbsoluteDates } from '../Date';

async function removeLineFromFile(id: number) {
  try {
    const files: File[] | null = configStorage.get('files') as File[];
    const activeFile: File | null = getActiveFile(files);
    const todoFileBookmark = activeFile?.todoFileBookmark;
    const todoFilePath = activeFile?.todoFilePath;

    if (activeFile && todoFilePath) {
      lines.splice(id, 1);
      const modifiedContent = lines.join('\n');

      if (todoFileBookmark) {
        app.startAccessingSecurityScopedResource(todoFileBookmark);
      }

      await fs.writeFile(todoFilePath, modifiedContent, 'utf8');

      return Promise.resolve(`Line ${id} removed from file`);
    } else {
      throw new Error("File path is undefined or file is not found.");
    }
  } catch (error: any) {
    console.error(error);
  }
}

async function writeTodoObjectToFile(id: number, inputString: string): Promise<string> {
  try {
    const multilineTextField: boolean = configStorage.get('multilineTextField');
    const useMultilineForBulkTodoCreation: boolean = configStorage.get('useMultilineForBulkTodoCreation');
    const convertRelativeToAbsoluteDates = configStorage.get('convertRelativeToAbsoluteDates');
    const appendCreationDate = configStorage.get('appendCreationDate');
    const files: File[] = configStorage.get('files');

    const content = (multilineTextField && useMultilineForBulkTodoCreation) ? inputString : inputString.replaceAll(/\n/g, String.fromCharCode(16));

    const linesToWrite = content.split('\n').filter(line => line.trim() !== '');

    if (linesToWrite.length === 0 && id < 1) {
      throw new Error("No string provided, won't write empty todo to file");
    } else {
      if (convertRelativeToAbsoluteDates) {
        for (let i = 0; i < linesToWrite.length; i++) {
          linesToWrite[i] = replaceSpeakingDatesWithAbsoluteDates(linesToWrite[i]);
        }
      }
      if (id >= 0) {
        lines[id] = linesToWrite.join('\n');
      } else {
        for (let i = 0; i < linesToWrite.length; i++) {
          const JsTodoTxtObject = new Item(linesToWrite[i]);
          if (appendCreationDate && !JsTodoTxtObject.created()) {
            JsTodoTxtObject.setCreated(new Date());
          }
          lines.push(JsTodoTxtObject.toString());
        }
      }
    }

    const modifiedContent: string = lines.join('\n');

    const activeFile: File | null = getActiveFile(files);
    const todoFileBookmark = activeFile?.todoFileBookmark;
    const todoFilePath = activeFile?.todoFilePath;

    if (!todoFilePath) {
      throw new Error('No active file found');
    }  

    if (todoFileBookmark) {
      app.startAccessingSecurityScopedResource(todoFileBookmark);
    }

    await fs.writeFile(todoFilePath, modifiedContent, 'utf8');

    if (id) {
      return Promise.resolve(`Line ${id + 1} overwritten successfully`);
    } else {
      return Promise.resolve(`New todo added successfully`);
    }
  } catch (error: any) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function replaceFileContent(string: string, filePath: string) {
  await fs.writeFile(filePath, string, 'utf8');
}

export { writeTodoObjectToFile, replaceFileContent, removeLineFromFile };
