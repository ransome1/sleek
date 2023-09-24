import { lines } from './CreateTodoObjects';
import { getActiveFile } from './ActiveFile';
import { configStorage } from '../config';
import fs from 'fs/promises';
import path from 'path';
import { Item } from 'jstodotxt';
import { File } from '../util';
import { replaceSpeakingDatesWithAbsoluteDates, extractSpeakingDates } from './Date';

async function writeTodoObjectToFile(id: number, string: string, remove: boolean): Promise<string> {
  if (string === '' && id < 1 && !remove) {
    throw new Error("No string provided, won't write empty todo to file");
  } else if (remove) {
    lines.splice(id, 1);
  } else {

    const convertRelativeToAbsoluteDates = configStorage.get('convertRelativeToAbsoluteDates');
    if(convertRelativeToAbsoluteDates) {
      string = replaceSpeakingDatesWithAbsoluteDates(string);
    }

    if (typeof id === 'number' && id >= 0) {
      lines[id] = string;
    } else {
      const appendCreationDate = configStorage.get('appendCreationDate');
      const item = new Item(string);
      if (appendCreationDate && !item.created()) {
        item.setCreated(new Date());
      }
      lines.push(item.toString());
    }
  }

  const modifiedContent = lines.join('\n');
  
  const files = configStorage.get('files') as File[];
  const activeFile = getActiveFile(files);

  if (!activeFile) {
    throw new Error('No active file found');
  }

  await fs.writeFile(activeFile?.todoFilePath, modifiedContent, 'utf8');

  if (id && !remove) {
    return `Line ${id + 1} overwritten successfully`;
  } else if (remove) {
    return `Line ${id} removed from file`;
  } else {
    return `New todo added successfully`;
  }
}

async function writeStringToFile(string: string, filePath: string) {
  await fs.writeFile(filePath, string, 'utf8');
}

export { writeTodoObjectToFile, writeStringToFile };