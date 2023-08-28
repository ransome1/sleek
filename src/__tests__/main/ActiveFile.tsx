import { getActiveFile } from '../../main/modules/ActiveFile';

interface File {
  active: boolean;
  path: string;
  todoFile: string;
  doneFile: string;
}

describe('Get active file', () => {

  test('Should return the active file', () => {
    const files: File[] = [
      {
        active: false,
        path: '/',
        todoFile: 'test1.txt',
        doneFile: 'done.txt',
      },
      {
        active: true,
        path: '/',
        todoFile: 'test2.txt',
        doneFile: 'done.txt',
      },
    ]
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual({
      active: true,
      path: '/',
      todoFile: 'test2.txt',
      doneFile: 'done.txt',
    });
  });

  test('Should return null if the files array is empty', () => {
    const files: File[] = []
    const activeFile = getActiveFile(files);
    expect(activeFile).toEqual(null);
  });  
});