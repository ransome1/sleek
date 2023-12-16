import { app } from 'electron';
import fs from 'fs/promises';
import { Item } from 'jstodotxt';
import { lines } from '../ProcessDataRequest/CreateTodoObjects';
import { getActiveFile } from './Active';
import { configStorage } from '../../config';
import { File } from '../../util';
import { replaceSpeakingDatesWithAbsoluteDates } from '../Date';

let stopAccessingSecurityScopedResource: any;

async function removeLineFromFile(id: number) {
  const activeFile: File | null = getActiveFile();

  if(activeFile === null) {
    throw new Error('No active file defined');
  }

  const bookmark = activeFile.todoFileBookmark;
  const todoFilePath = activeFile.todoFilePath;

  if(activeFile === null) {
    throw new Error('Todo file is not defined');
  }

  lines.splice(id, 1);
  const modifiedContent = lines.join('\n');

  if(bookmark) app.startAccessingSecurityScopedResource(bookmark)

  await fs.writeFile(todoFilePath, modifiedContent, 'utf8');

  if(bookmark) stopAccessingSecurityScopedResource()

  return `Line ${id} removed from file`;
}

async function writeTodoObjectToFile(id: number, inputString: string): Promise<string> {
  const multilineTextField: boolean = configStorage.get('multilineTextField');
  const useMultilineForBulkTodoCreation: boolean = configStorage.get('useMultilineForBulkTodoCreation');
  const convertRelativeToAbsoluteDates = configStorage.get('convertRelativeToAbsoluteDates');
  const appendCreationDate = configStorage.get('appendCreationDate');
  const content = (multilineTextField && useMultilineForBulkTodoCreation) ? inputString : inputString.replaceAll(/\n/g, String.fromCharCode(16));
  const linesToWrite = content.split('\n').filter(line => line.trim() !== '');

  if(linesToWrite.length === 0 && id < 1) {
    throw new Error("No string provided, won't write empty todo to file");
  } else {
    if(convertRelativeToAbsoluteDates) {
      for (let i = 0; i < linesToWrite.length; i++) {
        linesToWrite[i] = replaceSpeakingDatesWithAbsoluteDates(linesToWrite[i]);
      }
    }
    if(id >= 0) {
      lines[id] = linesToWrite.join('\n');
    } else {
      for (let i = 0; i < linesToWrite.length; i++) {
        const JsTodoTxtObject = new Item(linesToWrite[i]);
        if(appendCreationDate && !JsTodoTxtObject.created()) {
          JsTodoTxtObject.setCreated(new Date());
        }
        lines.push(JsTodoTxtObject.toString());
      }
    }
  }

  const modifiedContent: string = lines.join('\n');
  const activeFile: File | null = getActiveFile();

  if(activeFile === null) {
    throw new Error('Todo file is not defined');
  }

  const todoFileBookmark = activeFile.todoFileBookmark;
  const todoFilePath = activeFile.todoFilePath;

  if(!todoFilePath) {
    throw new Error('No active file found');
  }  

  if(todoFileBookmark) {
    app.startAccessingSecurityScopedResource(todoFileBookmark);
  }

  await fs.writeFile(todoFilePath, modifiedContent, 'utf8');

  if(id) {
    return `Line ${id + 1} overwritten successfully`;
  } else {
    return `New todo added successfully`;
  }
}

async function replaceFileContent(string: string, filePath: string) {
  await fs.writeFile(filePath, string, 'utf8');
}

export { writeTodoObjectToFile, replaceFileContent, removeLineFromFile };
