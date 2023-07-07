import { lines } from '../modules/todoObjects';
import { activeFile } from '../util';
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
  const activeFilePath = activeFile()?.path || '';

  await fs.writeFile(activeFilePath, modifiedContent, 'utf8');
  if (id) {
    return `Line ${id + 1} overwritten successfully`
  } else {
    return `New line added`
  }
}

export { writeTodoObjectToFile };
