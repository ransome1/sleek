//import fs from 'fs/promises';
import path from 'path';
//import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { getActiveFile } from '../../main/modules/File';
//import { configStorage } from '../../main/config';

//import { lines } from '../../main/modules/TodoObjects';

// jest.mock('../../main/modules/TodoObjects', () => ({
//   lines: ['Line 1', 'Line 2', 'Line 3'],
// }));

// jest.mock('../../main/modules/File', () => ({
//   getActiveFile: jest.fn().mockReturnValue({
//     path: path.join(__dirname, '..', '__mock__', 'test.txt'),
//   }),
// }));

jest.mock('../../main/config');

const configStorage = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('getActiveFile', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  // test('should return null when no files are present', () => {
  //   //configStorage.get.mockReturnValue(undefined);
  //   (configStorage.get as jest.Mock).mockReturnValue(undefined);
  //   expect(getActiveFile()).toBeNull();
  // });

  // test('should return null when files array is empty', () => {
  //   //configStorage.get.mockReturnValue([]);
  //   (configStorage.get as jest.Mock).mockReturnValue([]);
  //   expect(getActiveFile()).toBeNull();
  // });

  test('should return the active file', () => {
    const mockFiles = [
      { active: false, path: '/path/to/file1.txt', filename: 'file1.txt' },
      { active: true, path: '/path/to/file2.txt', filename: 'file2.txt' },
    ];

    configStorage.get('files').mockReturnValue(mockFiles);

    expect(getActiveFile()).toEqual({
      active: true,
      path: '/path/to/file2.txt',
      filename: 'file2.txt',
    });
  });
  
});


