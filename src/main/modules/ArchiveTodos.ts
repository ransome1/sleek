import fs from 'fs/promises';
import path from 'path';
import { getActiveFile } from './ActiveFile';
import { configStorage } from '../config';
import { writeStringToFile } from './WriteToFile';
import { createTodoObjects } from './CreateTodoObjects';

async function archiveTodos() {
  const files = configStorage.get('files');
  const file = getActiveFile(files);

  if (!file) return null;

  const todoFilePath = path.join(file.path, '', file.todoFile);
  const doneFilePath = path.join(file.path, '', file.doneFile);

  let contentTodoFile = '';
  let contentDoneFile = '';

  try {
    contentTodoFile = await fs.readFile(todoFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading todo file:', error);
  }

  try {
    contentDoneFile = await fs.readFile(doneFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading done file:', error);
  }

  const todoObjects = createTodoObjects(contentTodoFile);

  const completedTodoStrings = todoObjects
    .filter(todoObject => todoObject.complete)
    .map(todoObject => todoObject.string);

  const notCompletedTodoStrings = todoObjects
    .filter(todoObject => !todoObject.complete)
    .map(todoObject => todoObject.string); 

  const stringDoneFile = contentDoneFile.trim() === '' ? 
    completedTodoStrings.join('\n') : 
    contentDoneFile + '\n' + completedTodoStrings.join('\n');
  
  const stringTodoFile = notCompletedTodoStrings.join('\n');

  writeStringToFile(stringDoneFile, doneFilePath);
  writeStringToFile(stringTodoFile, todoFilePath);
}

export default archiveTodos;
