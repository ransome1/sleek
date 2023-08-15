import { lines } from './CreateTodoObjects';
import { getActiveFile } from './ActiveFile';
import { configStorage } from '../config';
import fs from 'fs/promises';
import path from 'path';
import { Item } from 'jstodotxt';

async function writeTodoObjectToFile(id: number, string: string, remove: boolean): Promise<string> {
  if (string === '' && id < 1 && !remove) {
    throw new Error("No string provided, won't write empty todo to file");
  } else if (remove) {
    lines.splice(id, 1);
  } else {
    if (typeof id === 'number' && id >= 0) {
      lines[id] = string;
    } else {
      const appendCreationDate = configStorage.get('appendCreationDate');
      if (appendCreationDate) {
        const item = new Item(string);
        if (!item.created()) {
          item.setCreated(new Date());
        }
        string = item.toString();
      }
      lines.push(string);
    }
  }

  const modifiedContent = lines.join('\n');
  const files = configStorage.get('files');
  const activeFile = getActiveFile(files);

  if (!activeFile) {
    throw new Error('No active file found');
  }

  await fs.writeFile(path.join(activeFile?.path, '', activeFile?.todoFile), modifiedContent, 'utf8');

  if (id && !remove) {
    return `Line ${id + 1} overwritten successfully`;
  } else if (remove) {
    return `Line ${id} removed from file`;
  } else {
    return `New todo added successfully`;
  }
}

async function writeStringToFile(string: string, filePath: string): Promise<string> {
  await fs.writeFile(filePath, string, 'utf8');
}

export { writeTodoObjectToFile, writeStringToFile };