import fs from 'fs/promises';
import path from 'path';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { getActiveFile } from '../../main/modules/File';
import { lines } from '../../main/modules/TodoObjects';

jest.mock('../../main/modules/TodoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
}));

jest.mock('../../main/modules/File', () => ({
  getActiveFile: jest.fn().mockReturnValue({
    path: path.join(__dirname, '..', '__mock__', 'test.txt'),
  }),
}));

describe('writeTodoObjectToFile', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test('should fail if no string is provided', async () => {
    await expect(writeTodoObjectToFile(-1, '', false)).rejects.toThrow(
      "No string provided, won't write empty todo to file"
    );
  });

  test('should write a new line when id is not provided', async () => {
    await writeTodoObjectToFile(-1, 'New line', false);
    expect(lines.pop()).toEqual('New line');
  });

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line', false);
    expect(lines).toEqual(['Line 1', 'Edited line', 'Line 3']);
  });

  test('should delete a line when remove is true', async () => {
    await writeTodoObjectToFile(1, '', true);
    expect(lines).toEqual(['Line 1', 'Line 3']);
  });
  
});


