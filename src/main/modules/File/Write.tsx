import { app } from 'electron';
import fs from 'fs/promises';
import { Item } from 'jstodotxt';
import { lines } from '../ProcessDataRequest/CreateTodoObjects';
import { getActiveFile } from './Active';
import { configStorage } from '../../config';
import { replaceSpeakingDatesWithAbsoluteDates } from '../Date';

async function removeLineFromFile(id: number): Promise<string> {
  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    throw new Error('No active file');
  }
  const bookmark = activeFile.todoFileBookmark;
  const todoFilePath = activeFile.todoFilePath;

  lines.splice(id, 1);
  const modifiedContent = lines.join('\n');

  if(process.mas && bookmark) {
    const stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);  
    await fs.writeFile(todoFilePath, modifiedContent, 'utf8');
    stopAccessingSecurityScopedResource()
  } else {
    await fs.writeFile(todoFilePath, modifiedContent, 'utf8');
  }

  return `Line ${id} removed from file`;
}

async function writeTodoObjectToFile(id: number, string: string): Promise<void> {
  const activeFile: FileObject | null = getActiveFile();
  if(!activeFile) {
    throw new Error('Todo file is not defined');
  }
  const bookmark = activeFile.todoFileBookmark;
  const todoFilePath = activeFile.todoFilePath;

  const bulkTodoCreation: boolean = configStorage.get('bulkTodoCreation');
  const convertRelativeToAbsoluteDates = configStorage.get('convertRelativeToAbsoluteDates');
  const appendCreationDate = configStorage.get('appendCreationDate');
  
  const content = 
    (bulkTodoCreation) 
      ? string.replaceAll(String.fromCharCode(16), '\n') 
      : string.replaceAll(/\n/g, String.fromCharCode(16));

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

  if(process.mas && bookmark) {
    const stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);  
    await fs.writeFile(todoFilePath, lines.join('\n'), 'utf8');
    stopAccessingSecurityScopedResource()
  } else {
    await fs.writeFile(todoFilePath, lines.join('\n'), 'utf8');
  }
}

export { writeTodoObjectToFile, removeLineFromFile };
