import { getActiveFile } from '../../main/modules/File/Active';
import { File } from '../../main/util';

describe('Get active file', () => {

  test('Should return the active file', () => {
    const files: File[] = [
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
      },
    ]
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual({
      active: true,
      todoFileName: 'test2.txt',
      todoFilePath: '/test2.txt',
      todoFileBookmark: null,
      doneFilePath: 'done.txt',
      doneFileBookmark: null,
    });
  });

  test('Should return null if the files array is empty', () => {
    const files: File[] = []
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual(null);
  });  
});