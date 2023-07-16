import fs from 'fs/promises';
import path from 'path';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { lines } from '../../main/modules/TodoObjects';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue(path.join(__dirname, '..', '__mock__', 'test.txt')),
  },
}));

jest.mock('../../main/modules/TodoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
}));

const mockFilePath = path.join(__dirname, '..', '__mock__', 'test.txt');

describe('writeTodoObjectToFile', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await fs.writeFile(mockFilePath, '');
  });

  test('should fail if no string is provided', async () => {
    await expect(writeTodoObjectToFile(-1, '')).rejects.toThrow(
      "No string provided, won't write empty todo to file"
    );
  });

  test('should write a new line when id is not provided', async () => {
    await writeTodoObjectToFile(-1, 'New line');
    expect(lines.pop()).toEqual('New line');
  });

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line');
    expect(lines).toEqual(['Line 1', 'Edited line', 'Line 3']);
  });
  
});


