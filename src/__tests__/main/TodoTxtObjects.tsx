import { sortTodoTxtObjects } from '../../main/modules/ProcessTodoTxtObjects';

const todoObjects = {
"A": [
    {
        "id": 0,
        "body": "Line 1",
        "created": null,
        "complete": false,
        "priority": "A",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(A) Line 1"
    }
],
"B": [
    {
        "id": 1,
        "body": "Line 2",
        "created": null,
        "complete": false,
        "priority": "B",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(B) Line 2"
    }
],
"C": [
    {
        "id": 2,
        "body": "Line 3",
        "created": null,
        "complete": false,
        "priority": "C",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(C) Line 3"
    }
  ]
}

const todoObjectsInverted = {
"C": [
    {
        "id": 2,
        "body": "Line 3",
        "created": null,
        "complete": false,
        "priority": "C",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(C) Line 3"
    }
],
"B": [
    {
        "id": 1,
        "body": "Line 2",
        "created": null,
        "complete": false,
        "priority": "B",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(B) Line 2"
    }
],
"A": [
    {
        "id": 0,
        "body": "Line 1",
        "created": null,
        "complete": false,
        "priority": "A",
        "contexts": [],
        "projects": [],
        "due": null,
        "t": null,
        "rec": null,
        "tags": null,
        "string": "(A) Line 1"
    }
  ]
}

// jest.mock('electron', () => ({
//   mainWindow: jest.fn(),
//   ipcMain: {
//     on: jest.fn(),
//   },
//   app: {
//     on: jest.fn(),
//     getPath: jest.fn(),
//     getVersion: jest.fn(),
//     getName: jest.fn(),
//     whenReady: jest.fn(),
//   },
// }));


describe('sortTodoTxtObjects', () => {
  test('invertGroupSorting', () => {
    const sortedTodoObjects = sortTodoTxtObjects(todoObjects);
    expect(sortedTodoObjects).toEqual(todoObjectsInverted);
  });
});