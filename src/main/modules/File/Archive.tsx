import { app } from 'electron';
import fs from 'fs/promises';
import { getActiveFile } from './Active';
import { replaceFileContent } from './Write';
import { mainWindow } from '../../main';
import { createTodoObjects } from '../ProcessDataRequest/CreateTodoObjects';

function handleRequestArchive(): void {
  const activeFile = getActiveFile();
  mainWindow!.webContents.send('triggerArchiving', Boolean(activeFile?.doneFilePath));
}

async function extractTodoObjectsFromFile(filePath: string, complete: boolean | null, bookmark: string | null): Promise<string[]> {
  let fileContent;

  if(process.mas && bookmark) {
    const stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);  
    fileContent = await fs.readFile(filePath, 'utf8');
    stopAccessingSecurityScopedResource()
  } else {
    fileContent = await fs.readFile(filePath, 'utf8');
  }

  const todoObjects = await createTodoObjects(fileContent);

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

  const completedTodos = await extractTodoObjectsFromFile(activeFile.todoFilePath, true, activeFile.todoFileBookmark);

  if(completedTodos.length === 0) {
    return 'No completed todos found';
  }

  const uncompletedTodos = await extractTodoObjectsFromFile(activeFile.todoFilePath, false, activeFile.todoFileBookmark);
  const todosFromDoneFile = await extractTodoObjectsFromFile(activeFile.doneFilePath, true, activeFile.doneFileBookmark);

  const stringDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');
  const stringTodoFile = uncompletedTodos.join('\n');

  await replaceFileContent(stringDoneFile, activeFile.doneFilePath);
  await replaceFileContent(stringTodoFile, activeFile.todoFilePath);

  return 'Successfully archived';
}

export { archiveTodos, handleRequestArchive };
