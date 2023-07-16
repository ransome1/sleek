import { lines } from '../modules/TodoObjects';
import { configStorage } from '../config';
import fs from 'fs/promises';

async function writeTodoObjectToFile(id: number, string: string) {
  if (!string) {
    throw new Error(`No string provided, won't write empty todo to file`);
  }

  if (typeof id === 'number' && id >= 0) {
    lines[id] = string;
  } else {
    lines.push(string);
  }

  const modifiedContent = lines.join('\n');

  const activeFile = configStorage.get('activeFile') as string;

  await fs.writeFile(activeFile, modifiedContent, 'utf8');
  if (id) {
    return `Line ${id + 1} overwritten successfully`
  } else {
    return `New line added`
  }
}

export { writeTodoObjectToFile };
