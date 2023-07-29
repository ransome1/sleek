import { configStorage } from '../../main/config';
import { addFile, removeFile, setFile } from '../../main/modules/File';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      { active: false, path: '/path/to/test1.txt', filename: 'test1.txt' },
      { active: true, path: '/path/to/test2.txt', filename: 'test2.txt' },
      { active: false, path: '/path/to/test3.txt', filename: 'test3.txt' },
    ]),
    set: jest.fn(),
  },
}));

jest.mock('../../main/modules/FileWatcher', () => jest.fn());

describe('File functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('addFile should add a new file to the config storage', async () => {
    await addFile('/path/to/test4.txt');
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        path: '/path/to/test1.txt',
        filename: 'test1.txt',
      },
      {
        active: false,
        path: '/path/to/test2.txt',
        filename: 'test2.txt',
      },
      {
        active: false,
        path: '/path/to/test3.txt',
        filename: 'test3.txt',
      },
      {
        active: true,
        path: '/path/to/test4.txt',
        filename: 'test4.txt',
      },
    ]);
  });
  test('removeFile should remove a file from the config storage, the active file stays unchanged', async () => {
    await removeFile(1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        path: '/path/to/test1.txt',
        filename: 'test1.txt',
      },
      {
        active: false,
        path: '/path/to/test3.txt',
        filename: 'test3.txt',
      },
      {
        active: true,
        path: '/path/to/test4.txt',
        filename: 'test4.txt',
      }
    ]);
  });
  test('removeFile should remove the active file from the config storage, a new active file is defined', async () => {
    await removeFile(2);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: true,
        path: '/path/to/test1.txt',
        filename: 'test1.txt',
      },
      {
        active: false,
        path: '/path/to/test3.txt',
        filename: 'test3.txt',
      }
    ]);
  });
  test('setFile should set a file as active in the config storage', async () => {
    await setFile(1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        path: '/path/to/test1.txt',
        filename: 'test1.txt',
      },
      {
        active: true,
        path: '/path/to/test3.txt',
        filename: 'test3.txt',
      }
    ]);
  });  
});
