import { todoTxtObjects, lines } from '../../main/modules/TodoTxtObjects';
import { Item } from 'jsTodoTxt';
import { activeFile } from '../../main/util';
import fs from 'fs/promises';
import { changeCompleteState, createTodoTxtObject, writeTodoTxtObjectToFile } from '../../main/modules/TodoTxtObject';
import { ipcMain } from 'electron';

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}));

jest.mock('../../main/modules/TodoTxtObjects', () => ({
  todoTxtObjects: {},
  lines: [],
}));

jest.mock('../../main/util', () => ({
  activeFile: jest.fn(),
}));

jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
  },
}));

describe('Change state of todo and write result to file', () => {
  beforeEach(() => {
    todoTxtObjects['file1'] = [
      { id: 1, body: 'Task 1', complete: false, created: null, completed: null },
      { id: 2, body: 'Task 2', complete: false, created: null, completed: null },
    ];
    lines.length = 2;
    lines.fill('');
  });

  afterEach(() => {
    todoTxtObjects['file1'] = [];
    lines.length = 0;
  });

  test('should change the complete state of a todo item', () => {
    const id = 1;
    const state = true;

    changeCompleteState(id, state);

    expect(todoTxtObjects['file1'][0].complete).toBe(true);
    expect(todoTxtObjects['file1'][0].completed).not.toBeNull();
  });

  test('should update and write the modified todoTxtObject to the file', async () => {
    const lineNumber = 0;
    const todoObject = {
      id: 1,
      body: 'Task 1',
      priority: null,
      created: null,
      complete: false,
      completed: null,
    };
    const todoTxtObject = new Item(todoObject.body);

    jest.spyOn(todoTxtObject, 'toString').mockReturnValue('Task 1');

    await writeTodoTxtObjectToFile(todoTxtObject, lineNumber);

    expect(lines[lineNumber]).toBe('Task 1');
    const activeFilePath = activeFile()?.path || '';
    const creationCompletionDate = new Date().toISOString().split('T')[0];
    const temp = `\nx ${creationCompletionDate} ${creationCompletionDate} Task 1`;
    expect(fs.writeFile).toHaveBeenCalledWith(activeFilePath, temp, 'utf8');
  });

  // Add more test cases as needed
});
