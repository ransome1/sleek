import { configStorage } from '../../main/config';
import { addFile, removeFile, setFile } from '../../main/modules/File';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      { active: false, path: '/path/to', todoFile: 'test1.txt', doneFile: 'done.txt' },
      { active: true, path: '/path/to', todoFile: 'test2.txt', doneFile: 'done.txt' },
      { active: false, path: '/path/to', todoFile: 'test3.txt', doneFile: 'done.txt' },
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
        path: '/path/to',
        todoFile: 'test1.txt',
        doneFile: 'done.txt',
      },
      {
        active: false,
        path: '/path/to',
        todoFile: 'test2.txt',
        doneFile: 'done.txt',
      },
      {
        active: false,
        path: '/path/to',
        todoFile: 'test3.txt',
        doneFile: 'done.txt',
      },
      {
        active: true,
        path: '/path/to',
        todoFile: 'test4.txt',
        doneFile: 'done.txt',
      },
    ]);
  });
  test('removeFile should remove a file from the config storage, the active file stays unchanged', async () => {
    await removeFile(null, 1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        path: '/path/to',
        todoFile: 'test1.txt',
        doneFile: 'done.txt',
      },
      {
        active: false,
        path: '/path/to',
        todoFile: 'test3.txt',
        doneFile: 'done.txt',
      },
      {
        active: true,
        path: '/path/to',
        todoFile: 'test4.txt',
        doneFile: 'done.txt',
      }
    ]);
  });
  test('removeFile should remove the active file from the config storage, a new active file is defined', async () => {
    await removeFile(null, 2);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: true,
        path: '/path/to',
        todoFile: 'test1.txt',
        doneFile: 'done.txt',
      },
      {
        active: false,
        path: '/path/to',
        todoFile: 'test3.txt',
        doneFile: 'done.txt',
      }
    ]);
  });
  test('setFile should set a file as active in the config storage', async () => {
    await setFile(null, 1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        path: '/path/to',
        todoFile: 'test1.txt',
        doneFile: 'done.txt',
      },
      {
        active: true,
        path: '/path/to',
        todoFile: 'test3.txt',
        doneFile: 'done.txt',
      }
    ]);
  });  
});
