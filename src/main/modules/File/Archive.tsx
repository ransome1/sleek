import { app, IpcMainEvent } from 'electron';
import fs from 'fs/promises';
import { getActiveFile } from './Active';
import { mainWindow } from '../../main';
import { configStorage } from '../../config';
import { replaceFileContent } from './Write';
import { createTodoObjects } from '../TodoObject/CreateTodoObjects';
import { File } from '../../util';

async function extractTodoStringsFromFile(filePath: string, complete: boolean | null, bookmark: string | null): Promise<string[]> {
  try {
    let stopAccessingSecurityScopedResource: any;

    if (bookmark) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(bookmark);
    
    const content = await fs.readFile(filePath, 'utf8');

    if (bookmark) stopAccessingSecurityScopedResource();

    const todoObjects = createTodoObjects(content);

    const validTodoStrings = todoObjects
      .filter((todoObject) => todoObject && (complete === null || todoObject.complete === complete))
      .map((todoObject) => (todoObject?.string ?? '').toString());

    return validTodoStrings;
  } catch (error: any) {
    return error;
  }
}

async function archiveTodos(event: IpcMainEvent | undefined): Promise<void> {
  try {
    const files: File[] = configStorage.get('files');
    const activeFile: File | null = getActiveFile(files);

    if(!activeFile?.todoFilePath) {
      throw new Error(`No active file found`);
    } else if(!activeFile.doneFilePath) {
      throw new Error(`No archiving file found`);
    }
    
    const completedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, true, activeFile?.todoFileBookmark);

    if(completedTodos.length === 0) {
      throw new Error(`No completed todos found`);
    }

    const uncompletedTodos = await extractTodoStringsFromFile(activeFile.todoFilePath, false, activeFile?.todoFileBookmark);
    const todosFromDoneFile = await extractTodoStringsFromFile(activeFile.doneFilePath, true, activeFile?.doneFileBookmark);
    
    const stringDoneFile = todosFromDoneFile.length === 0 ? completedTodos.join('\n') : todosFromDoneFile.join('\n') + '\n' + completedTodos.join('\n');
    const stringTodoFile = uncompletedTodos.join('\n');

    await replaceFileContent(stringDoneFile, activeFile.doneFilePath);
    await replaceFileContent(stringTodoFile, activeFile.todoFilePath);
    
    if(event) event.reply('ArchivingResult', `Successfully archived`)

  } catch (error: any) {
    if(event) event.reply('ArchivingResult', error)
  }
}

export default archiveTodos;
