import { getActiveFile } from '../../main/modules/ActiveFile';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

test('Should return the active file', () => {
  const files: File[] = [
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
  ]
  const activeFile = getActiveFile(files);
  expect(activeFile).toEqual({
    active: true,
    path: 'test2.txt',
    filename: 'test2.txt',
  });
});
