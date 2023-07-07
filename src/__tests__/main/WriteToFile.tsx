import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { lines } from '../../main/modules/todoObjects';

jest.mock('../../main/modules/todoObjects', () => ({
  lines: ['Line 1', 'Line 2', 'Line 3'],
}));

jest.mock('../../main/util', () => ({
  activeFile: jest.fn().mockReturnValue({
    active: true,
    path: 'src/testData/test.txt',
    file: 'test.txt',
  }),
}));

describe('write todo to file', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fail if no string is provided', async () => {
    await expect(writeTodoObjectToFile(-1, '')).rejects.toThrow(
      "No string provided, won't write empty todo to file"
    );
  });

  test('should write a new line when id is not provided', async () => {
    await writeTodoObjectToFile(-1, 'New line');
    expect(lines.pop()).toEqual('New line');
  });

  test('should overwrite a line when id is provided', async () => {
    await writeTodoObjectToFile(1, 'Edited line');
    expect(lines).toEqual(['Line 1', 'Edited line', 'Line 3']);
  });
});