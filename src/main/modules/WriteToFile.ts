import { lines } from './CreateTodoObjects';
import { getActiveFile } from './ActiveFile';
import { configStorage } from '../config';
import fs from 'fs/promises';

async function writeTodoObjectToFile(id: number, string: string, remove: boolean): Promise<string> {
  if (string === '' && id < 1 && !remove) {
    throw new Error(`No string provided, won't write empty todo to file`);
  } else if (remove) {
    lines.splice(id, 1);
  } else {
    if (typeof id === 'number' && id >= 0) {
      lines[id] = string;
    } else {
      lines.push(string);
    }
  }

  const modifiedContent = lines.join('\n');

  const activeFilePath = getActiveFile()?.path;

  if (!activeFilePath) {
    throw new Error('No active file found');
  }

  await fs.writeFile(activeFilePath, modifiedContent, 'utf8');

  if (id && !remove) {
    return `Line ${id + 1} overwritten successfully`;
  } else if (remove) {
    return `Line ${id} removed from file`;
  } else {
    return `New todo added successfully`;
  }
}

export { writeTodoObjectToFile };
