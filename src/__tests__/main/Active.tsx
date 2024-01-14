import { getActiveFile } from '../../main/modules/File/Active';

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn((key) => {
      if(key === 'files') {
        return [
          {
            active: false,
            todoFileName: 'test1.txt',
            todoFilePath: '/test1.txt',
            todoFileBookmark: null,
            doneFilePath: 'done.txt',
            doneFileBookmark: null,
          },
          {
            active: true,
            todoFileName: 'test2.txt',
            todoFilePath: '/test2.txt',
            todoFileBookmark: null,
            doneFilePath: 'done.txt',
            doneFileBookmark: null,
          }
        ];
      }
    }),
    set: jest.fn(),
  },
}));

describe('Get active file', () => {
  test('Should return the active file', () => {
    const activeFile = getActiveFile();
    expect(activeFile).toEqual({
      active: true,
      todoFileName: 'test2.txt',
      todoFilePath: '/test2.txt',
      todoFileBookmark: null,
      doneFilePath: 'done.txt',
      doneFileBookmark: null,
    });
  });
});
