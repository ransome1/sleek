import path from 'path'
import { configStorage } from '../../main/config';
import { addFile, removeFile, setFile } from '../../main/modules/File/File';

jest.mock('../../main/main', () => ({
  mainWindow: {
    webContents: {
      send: jest.fn(),
    },
  },
}));

jest.mock('../../main/modules/File/Watcher', () => ({
  createFileWatcher: jest.fn(),
}));

jest.mock('../../main/modules/Tray', () => ({
  createTray: jest.fn(),
}));

jest.mock('../../main/modules/Menu', () => ({
  createMenu: jest.fn(),
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      { active: false, todoFileName: 'test1.txt', todoFilePath: path.join('/', 'path', 'to', 'test1.txt'), todoFileBookmark: null, doneFilePath: null, doneFileBookmark: null },
      { active: true, todoFileName: 'test2.txt', todoFilePath: path.join('/', 'path', 'to', 'test2.txt'), todoFileBookmark: null, doneFilePath: null, doneFileBookmark: null },
      { active: false, todoFileName: 'test3.txt', todoFilePath: path.join('/', 'path', 'to', 'test3.txt'), todoFileBookmark: null, doneFilePath: null, doneFileBookmark: null  },
    ]),
    set: jest.fn(),
  },
}));

describe('File functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addFile should add a new file to the config storage', async () => {
    await addFile(path.join('/', 'path', 'to', 'test4.txt'), null);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test1.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: false,
        todoFileName: 'test2.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test2.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test3.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: true,
        todoFileName: 'test4.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test4.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
    ]);
  });
  test('removeFile should remove a file from the config storage, the active file stays unchanged', async () => {
    await removeFile(1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test1.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test3.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: true,
        todoFileName: 'test4.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test4.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
    ]);
  });
  test('removeFile should remove the active file from the config storage, a new active file is defined', async () => {
    await removeFile(2);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: true,
        todoFileName: 'test1.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test1.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: false,
        todoFileName: 'test3.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test3.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
    ]);
  });
  test('setFile should set a file as active in the config storage', async () => {
    await setFile(1);
    expect(configStorage.set).toHaveBeenCalledTimes(1);
    expect(configStorage.set).toHaveBeenCalledWith('files', [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test1.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
      {
        active: true,
        todoFileName: 'test3.txt',
        todoFilePath: path.join('/', 'path', 'to', 'test3.txt'),
        todoFileBookmark: null,
        doneFilePath: null,
        doneFileBookmark: null
      },
    ]);
  });  
});
