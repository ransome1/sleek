import { app, IpcMainEvent } from 'electron';
import fs from 'fs/promises';
import { getActiveFile } from './Active';
import { mainWindow } from '../../main';
import { configStorage } from '../../config';
import { replaceFileContent } from './Write';
import { createTodoObjects } from '../ProcessDataRequest/CreateTodoObjects';
import { File } from '../../util';

let stopAccessingSecurityScopedResource: any;

async function extractTodoStringsFromFile(filePath: string, complete: boolean | null, bookmark: string | null): Promise<string[]> {
  try {

    if (bookmark) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);
    
    const content = await fs.readFile(filePath, 'utf8');

    if (bookmark) stopAccessingSecurityScopedResource();

    const todoObjects = await createTodoObjects(content);

    const validTodoStrings = todoObjects
      .filter((todoObject) => todoObject && (complete === null || todoObject.complete === complete))
      .map((todoObject) => (todoObject?.string ?? '').toString());

    return Promise.resolve(validTodoStrings);
  } catch (error: any) {
    return Promise.reject(error);
  }
}

async function archiveTodos(): Promise<string> {
  const activeFile: File | null = getActiveFile();

  if (activeFile === null) {
    throw new Error('No active file defined');
  }

  if (activeFile.doneFilePath === null) {
    throw new Error('Archiving file is not defined');
  }
  
  const completedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, true, activeFile.todoFileBookmark);

  if(completedTodos.length === 0) {
    throw new Error(`No completed todos found`);
  }

  const uncompletedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, false, activeFile.todoFileBookmark);
  const todosFromDoneFile = await extractTodoStringsFromFile(activeFile.doneFilePath, true, activeFile.doneFileBookmark);
  
  const stringDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');
  const stringTodoFile = uncompletedTodos.join('\n');

  await replaceFileContent(stringDoneFile, activeFile.doneFilePath);
  await replaceFileContent(stringTodoFile, activeFile.todoFilePath);

  return 'Successfully archived';
}

export default archiveTodos;
