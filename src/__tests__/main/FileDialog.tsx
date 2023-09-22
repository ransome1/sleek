import { dialog } from 'electron';
import { openFile, createFile } from '../../main/modules/FileDialog';
import { addFile } from '../../main/modules/File';
import { configStorage } from '../../main/config';
import fs from 'fs/promises';

jest.mock('../../main/main', () => ({
  mainWindow: jest.fn(),
}));

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => './src/__tests__/__mock__'),
    getVersion: jest.fn(() => ''),
  },	
  dialog: {
    showOpenDialog: jest.fn(() => ({
      canceled: false,
      filePaths: ['./src/__tests__/__mock__/fileDialog.txt'],
    })),
    showSaveDialog: jest.fn(() => ({
      canceled: false,
      filePath: './src/__tests__/__mock__/fileDialog.txt',
    })),  
  },
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn()
  },
}));

jest.mock('../../main/modules/File', () => ({
  addFile: jest.fn(),
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}));

describe('openFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });	

  it('should call addFile when a file is selected', async () => {
    await openFile();

    expect(dialog.showOpenDialog).toHaveBeenCalledWith({
      properties: ['openFile'],
      filters: [{ name: 'Text files', extensions: ['txt'] }, { name: 'All files', extensions: ['*'] }],
    });

    expect(addFile).toHaveBeenCalledWith(null, './src/__tests__/__mock__/fileDialog.txt');
  });

  it('should not call addFile when file selection is canceled', async () => {
    (dialog.showOpenDialog as jest.Mock).mockReturnValueOnce({
      canceled: true,
      filePaths: [],
    });

    await openFile();

    expect(addFile).not.toHaveBeenCalled();
  });
});

describe('createFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call addFile after successfully creating a file', async () => {
    (dialog.showSaveDialog as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      filePath: './src/__tests__/__mock__/fileDialog.txt',
    });

    await createFile();

    expect(dialog.showSaveDialog).toHaveBeenCalledWith({
      defaultPath: expect.any(String),
      filters: [{ name: 'Text files', extensions: ['txt'] }, { name: 'All files', extensions: ['*'] }],
    });

    expect(fs.writeFile).toHaveBeenCalledWith('./src/__tests__/__mock__/fileDialog.txt', '');
    expect(addFile).toHaveBeenCalledWith(null, './src/__tests__/__mock__/fileDialog.txt');
  });

  it('should not call addFile when file creation is canceled', async () => {
    (dialog.showSaveDialog as jest.Mock).mockResolvedValueOnce({
      canceled: true,
      filePath: undefined,
    });

    await createFile();

    expect(addFile).not.toHaveBeenCalled();
  });
});
