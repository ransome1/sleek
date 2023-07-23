import { getActiveFile } from '../../main/modules/ActiveFile';

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
        path: 'test2.txt',
        filename: 'test2.txt',
      },
    ]),
  },
}));

// Test case
test('Should return the active file', () => {
  const activeFile = getActiveFile();
  expect(activeFile).toEqual({
    active: true,
    path: 'test2.txt',
    filename: 'test2.txt',
  });
});
