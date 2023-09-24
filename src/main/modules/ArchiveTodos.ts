import fs from 'fs/promises';
import path from 'path';
import { getActiveFile } from './ActiveFile';
import { configStorage } from '../config';
import { writeStringToFile } from './WriteToFile';
import { createTodoObjects } from './CreateTodoObjects';
import { TodoObject } from '../util';

async function extractTodosFromFile(filePath: string, complete: boolean): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const todoObjects = createTodoObjects(content);
    const strings = todoObjects
      .filter(todoObject => todoObject.complete === complete)
      .map(todoObject => todoObject.string);
    return strings;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function archiveTodos(): Promise<void> {
  try {
    const files = configStorage.get('files');
    const activeFile = getActiveFile(files);

    if (!activeFile) return;

    const todoFilePath = activeFile.todoFilePath;
    const doneFilePath = activeFile.doneFilePath;

    const completedTodos = await extractTodosFromFile(todoFilePath, true);
    const incompletedTodos = await extractTodosFromFile(todoFilePath, false);
    const todosFromDoneFile = await extractTodosFromFile(doneFilePath, true);

    const contentForDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');

    const stringDoneFile = contentForDoneFile;
    const stringTodoFile = incompletedTodos.join('\n');

    writeStringToFile(stringDoneFile, doneFilePath);
    writeStringToFile(stringTodoFile, todoFilePath);
  } catch(error) {
    console.error(error);
  }
}

export default archiveTodos;
