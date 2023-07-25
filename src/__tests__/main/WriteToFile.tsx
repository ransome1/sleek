import fs from 'fs';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { getActiveFile } from '../../main/modules/ActiveFile';
import { lines } from '../../main/modules/CreateTodoObjects';

jest.mock('../../main/modules/CreateTodoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      {
        active: false,
        path: 'test1.txt',
        filename: 'test1.txt',
      },
      {
        active: true,
        path: './src/__tests__/__mock__/test.txt',
        filename: 'test.txt',
      },
    ]),
  },
}));

describe('Writing to file', () => {
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
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual('Line 1\nLine 2\nLine 3\nNew line');
  });

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line', false);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual('Line 1\nEdited line\nLine 3\nNew line');
  });

  test('should delete a line when remove is true', async () => {
    await writeTodoObjectToFile(2, '', true);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual('Line 1\nEdited line\nNew line');
  });
  
});


