import { app } from 'electron';
import fs from 'fs/promises';
import { getActiveFile } from './Active';
import { replaceFileContent } from './Write';
import { mainWindow } from '../../main';
import { createTodoObjects } from '../ProcessDataRequest/CreateTodoObjects';

let stopAccessingSecurityScopedResource: any;

function handleRequestArchive(): void {
  const activeFile = getActiveFile();
  mainWindow!.webContents.send('triggerArchiving', Boolean(activeFile?.doneFilePath));
}

async function extractTodoStringsFromFile(filePath: string, complete: boolean | null, bookmark: string | null): Promise<string[]> {
  if(bookmark) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);

  const content = await fs.readFile(filePath, 'utf8');

  if(bookmark) stopAccessingSecurityScopedResource();

  const todoObjects = await createTodoObjects(content);

  return todoObjects
    .filter((todoObject) => todoObject && (complete === null || todoObject.complete === complete))
    .map((todoObject) => (todoObject?.string ?? '').toString());
}

async function archiveTodos(): Promise<string> {
  const activeFile: FileObject | null = getActiveFile();

  if(activeFile === null) {
    return 'No active file defined';
  }

  if(activeFile.doneFilePath === null) {
    return 'Archiving file is not defined';
  }

  const completedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, true, activeFile.todoFileBookmark);

  if(completedTodos.length === 0) {
    return 'No completed todos found';
  }

  const uncompletedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, false, activeFile.todoFileBookmark);
  const todosFromDoneFile = await extractTodoStringsFromFile(activeFile.doneFilePath, true, activeFile.doneFileBookmark);

  const stringDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');
  const stringTodoFile = uncompletedTodos.join('\n');

  await replaceFileContent(stringDoneFile, activeFile.doneFilePath);
  await replaceFileContent(stringTodoFile, activeFile.todoFilePath);

  return 'Successfully archived';
}

export { archiveTodos, handleRequestArchive };
