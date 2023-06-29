import { lines } from '../modules/TodoTxtObjects';
import { activeFile } from '../util';
import fs from 'fs/promises';

async function writeTodoTxtObjectToFile(id: number, string: string): Promise<void> {
  if (!string) {
    throw new Error(`No string provided, won't write empty todo to file`);
  }

  if (id && id >= 0 && id < lines.length) {
    lines[id] = string;
  } else {
    lines.push(string);
  }

  const modifiedContent = lines.join('\n');
  const activeFilePath = activeFile()?.path || '';

  try {
    await fs.writeFile(activeFilePath, modifiedContent, 'utf8');
    if (id) {
      console.log(`Line ${id + 1} overwritten successfully`);
    } else {
      console.log(`New line added`);
    }
  } catch (error) {
    throw error;
  }
}

export { writeTodoTxtObjectToFile };
