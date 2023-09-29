import { getActiveFile } from '../../main/modules/File/Active';
import { File } from '../../main/util';

describe('Get active file', () => {

  test('Should return the active file', () => {
    const files: File[] = [
      {
        active: false,
        todoFileName: 'test1.txt',
        todoFilePath: '/test1.txt',
        doneFilePath: 'done.txt',
      },
      {
        active: true,
        todoFileName: 'test2.txt',
        todoFilePath: '/test2.txt',
        doneFilePath: 'done.txt',
      },
    ]
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual({
      active: true,
      todoFileName: 'test2.txt',
      todoFilePath: '/test2.txt',
      doneFilePath: 'done.txt',
    });
  });

  test('Should return null if the files array is empty', () => {
    const files: File[] = []
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual(null);
  });  
});