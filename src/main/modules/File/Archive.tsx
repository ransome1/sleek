import fs from 'fs/promises';
import { getActiveFile } from './Active';
import { mainWindow } from '../../main';
import { configStorage } from '../../config';
import { writeStringToFile } from './Write';
import { createTodoObjects } from '../TodoObject/CreateTodoObjects';

async function extractTodosFromFile(filePath: string, complete: boolean): Promise<string[]> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const todoObjects = createTodoObjects(content);
    return todoObjects
      .filter(todoObject => todoObject.complete === complete)
      .map(todoObject => todoObject.string);
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function archiveTodos(): Promise<void> {
  try {
    const files = configStorage.get('files');
    const activeFile = getActiveFile(files);

    if (!activeFile) {
      mainWindow!.webContents.send('archiveTodos', new Error('No active file found'));
      return;
    }

    const todoFilePath = activeFile.todoFilePath;
    const doneFilePath = activeFile.doneFilePath;

    const completedTodos = await extractTodosFromFile(todoFilePath, true);
    const uncompletedTodos = await extractTodosFromFile(todoFilePath, false);
    const todosFromDoneFile = await extractTodosFromFile(doneFilePath, true);

    const stringDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');
    const stringTodoFile = uncompletedTodos.join('\n');

    await writeStringToFile(stringDoneFile, doneFilePath);
    await writeStringToFile(stringTodoFile, todoFilePath);

    mainWindow!.webContents.send('archiveTodos', `Todos successfully archived to: ${doneFilePath}`);

  } catch (error) {
    mainWindow!.webContents.send('archiveTodos', error);
    console.error(error);
  }
}

export default archiveTodos;
