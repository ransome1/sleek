import fs from 'fs/promises';
import { writeTodoObjectToFile, removeLineFromFile } from '../../main/modules/File/Write';
import { lines } from '../../main/modules/ProcessDataRequest/CreateTodoObjects';
import { configStorage } from '../../main/config';
import dayjs from 'dayjs';

const date: string = dayjs(new Date()).format('YYYY-MM-DD');

jest.mock('../../main/main', () => ({
  mainWindow: jest.fn(),
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn((key) => {
      if(key === 'files') {
        return [
          { active: false, todoFileName: 'test1.txt', todoFilePath: './src/__tests__/__mock__/test1.txt', todoFileBookmark: null, doneFile: 'done.txt', doneFileBookmark: null },
          { active: true, todoFileName: 'test.txt', todoFilePath: './src/__tests__/__mock__/test.txt', todoFileBookmark: null, doneFile: 'done.txt', doneFileBookmark: null },
          { active: false, todoFileName: 'test3.txt', todoFilePath: './src/__tests__/__mock__/test3.txt', todoFileBookmark: null, doneFile: 'done.txt', doneFileBookmark: null },
        ];
      } else if(key === 'appendCreationDate') {
        return false;
      } else if(key === 'convertRelativeToAbsoluteDates') {
        return true;
      }
    }),
    set: jest.fn(),
  },
}));

jest.mock('../../main/modules/ProcessDataRequest/CreateTodoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
}));

describe('Writing to file', () => {

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  test('should fail if no string is provided', async () => {
    await expect(writeTodoObjectToFile(-1, '')).rejects.toThrow("No string provided, won't write empty todo to file");
  });

  test('should write a new line when id is not provided', async () => {
    await writeTodoObjectToFile(-1, 'New line');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual('Line 1\nLine 2\nLine 3\nNew line');
  });

  test('should write a new line when id is not provided and append a creation date', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'appendCreationDate') {
        return true;
      }
      return originalGet.call(configStorage, key);
    };
    await writeTodoObjectToFile(-1, 'New line with creation date');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date`);
    configStorage.get = originalGet;
  });

  test('should write a new line when id is not provided and convert a relative (speaking) date to an absolute date', async () => {
    await writeTodoObjectToFile(-1, 'New line with relative threshold date t:June 3rd, 2005');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:2005-06-03`);
  });

  test('should overwrite a line when id is provided and NOT convert a relative (speaking) date to an absolute date', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'convertRelativeToAbsoluteDates') {
        return false;
      }
      return originalGet.call(configStorage, key);
    };
    await writeTodoObjectToFile(5, 'New line with relative threshold date t:June 3rd, 2005');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nLine 2\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
    configStorage.get = originalGet;
  });

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nLine 3\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
  });

  test('should delete a line when remove is true', async () => {
    await removeLineFromFile(2);
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005`);
  });

  test('should append 3 new lines at the end of the file', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'bulkTodoCreation') {
        return true;
      }
      return originalGet.call(configStorage, key);
    };

    const content = 'Line4\nLine5\nLine6';

    await writeTodoObjectToFile(-1, content);
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nNew line\n${date} New line with creation date\nNew line with relative threshold date t:June 3rd, 2005\nLine4\nLine5\nLine6`);
    configStorage.get = originalGet;
  });

  test('should update a specific line and append 2 lines to the updated line', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'bulkTodoCreation') {
        return true;
      }
      return originalGet.call(configStorage, key);
    };

    const content = 'Updated line\nAppend 1\nAppend 2';

    await writeTodoObjectToFile(3, content);
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nNew line\nUpdated line\nAppend 1\nAppend 2\nNew line with relative threshold date t:June 3rd, 2005\nLine4\nLine5\nLine6`);
    configStorage.get = originalGet;
  });

  test('should append a multi line todo', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'bulkTodoCreation') {
        return false;
      }
      return originalGet.call(configStorage, key);
    };

    const content = 'Multi line 1\nMulti line 2\nMulti line 3';

    await writeTodoObjectToFile(-1, content);
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nNew line\nUpdated line\nAppend 1\nAppend 2\nNew line with relative threshold date t:June 3rd, 2005\nLine4\nLine5\nLine6\nMulti line 1Multi line 2Multi line 3`);
    configStorage.get = originalGet;
  });

  test('should update line with a multi line todo', async () => {
    const originalGet = configStorage.get;
    configStorage.get = (key: string) => {
      if(key === 'bulkTodoCreation') {
        return false;
      }
      return originalGet.call(configStorage, key);
    };

    const content = 'Multi line 1\nMulti line 2\nMulti line 3';

    await writeTodoObjectToFile(2, content);
    const fileContent = await fs.readFile('./src/__tests__/__mock__/test.txt', 'utf8');
    expect(fileContent).toEqual(`Line 1\nEdited line\nMulti line 1Multi line 2Multi line 3\nUpdated line\nAppend 1\nAppend 2\nNew line with relative threshold date t:June 3rd, 2005\nLine4\nLine5\nLine6\nMulti line 1Multi line 2Multi line 3`);
    configStorage.get = originalGet;
  });
});
