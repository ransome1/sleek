import fs from 'fs';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { lines } from '../../main/modules/CreateTodoObjects';
import { configStorage } from '../../main/config';
import dayjs from 'dayjs';

const date: string = dayjs(new Date()).format('YYYY-MM-DD');

jest.mock('../../main/main', () => ({
  mainWindow: jest.fn(),
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn((key) => {
      if (key === 'files') {
        return [
          { active: false, path: './src/__tests__/__mock__', todoFile: 'test1.txt', doneFile: 'done.txt' },
          { active: true, path: './src/__tests__/__mock__', todoFile: 'test.txt', doneFile: 'done.txt' },
          { active: false, path: './src/__tests__/__mock__', todoFile: 'test3.txt', doneFile: 'done.txt' },
        ];
      } else if (key === 'appendCreationDate') {
        return false;
      } else if (key === 'convertRelativeToAbsoluteDates') {
        return true;
      }
    }),
    set: jest.fn(),
  },
}));

jest.mock('../../main/modules/CreateTodoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
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

  test('should write a new line when id is not provided and append a creation date', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if (key === 'appendCreationDate') {
        return true;
      }
      return originalGet.call(configStorage, key);
    };  
    await writeTodoObjectToFile(-1, 'New line with creation date', false);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date`);
    configStorage.get = originalGet;
  });

  test('should write a new line when id is not provided and convert a relative (speaking) date to an absolute date', async () => {
    await writeTodoObjectToFile(-1, 'New line with relative threshold date t:June 3rd, 2005', false);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:2005-06-03`);
  });

  test('should overwrite a line when id is provided and NOT convert a relative (speaking) date to an absolute date', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if (key === 'convertRelativeToAbsoluteDates') {
        return false;
      }
      return originalGet.call(configStorage, key);
    };    
    await writeTodoObjectToFile(5, 'New line with relative threshold date t:June 3rd, 2005', false);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
    configStorage.get = originalGet;
  });      

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line', false);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
  });

  test('should delete a line when remove is true', async () => {
    await writeTodoObjectToFile(2, '', true);
    const fileContent = fs.readFileSync('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
  });
});
