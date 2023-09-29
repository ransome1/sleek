import { configStorage } from '../../main/config';
import { addFile, removeFile, setFile } from '../../main/modules/File/File';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      { active: false, todoFileName: 'test1.txt', todoFilePath: '/path/to/test1.txt', doneFilePath: '/path/to/done.txt' },
      { active: true, todoFileName: 'test2.txt', todoFilePath: '/path/to/test2.txt', doneFilePath: '/path/to/done.txt' },
      { active: false, todoFileName: 'test3.txt', todoFilePath: '/path/to/test3.txt', doneFilePath: '/path/to/done.txt' },
    ]),
    set: jest.fn(),
  },
}));

jest.mock('../../main/modules/File/Watcher', () => jest.fn());

describe('File functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addFile should add a new file to the config storage', async () => {
    await addFile(null, '/path/to/test4.txt');
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: '/path/to/test1.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: false,
        todoFileName: 'test2.txt',
        todoFilePath: '/path/to/test2.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: '/path/to/test3.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: true,
        todoFileName: 'test4.txt',
        todoFilePath: '/path/to/test4.txt',
        doneFilePath: '/path/to/done.txt',
      },
    ]);
  });
  test('removeFile should remove a file from the config storage, the active file stays unchanged', async () => {
    await removeFile(null, 1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: '/path/to/test1.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: '/path/to/test3.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: true,
        todoFileName: 'test4.txt',
        todoFilePath: '/path/to/test4.txt',
        doneFilePath: '/path/to/done.txt',
      },
    ]);
  });
  test('removeFile should remove the active file from the config storage, a new active file is defined', async () => {
    await removeFile(null, 2);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: true,
        todoFileName: 'test1.txt',
        todoFilePath: '/path/to/test1.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: '/path/to/test3.txt',
        doneFilePath: '/path/to/done.txt',
      },
    ]);
  });
  test('setFile should set a file as active in the config storage', async () => {
    await setFile(null, 1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: '/path/to/test1.txt',
        doneFilePath: '/path/to/done.txt',
      },
      {
        active: true,
        todoFileName: 'test3.txt',
        todoFilePath: '/path/to/test3.txt',
        doneFilePath: '/path/to/done.txt',
      },
    ]);
  });  
});
