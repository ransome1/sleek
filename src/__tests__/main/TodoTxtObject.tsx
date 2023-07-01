import { todoTxtObjects, lines } from '../../main/modules/TodoTxtObjects';
import { Item } from 'jsTodoTxt';
import { activeFile } from '../../main/util';
import fs from 'fs/promises';
import { changeCompleteState } from '../../main/modules/TodoTxtObject';
import { writeTodoTxtObjectToFile } from '../../main/modules/WriteToFile';
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

});
