import { sortGroups, groupTodoTxtObjects, applySearchString, countTodoObjects } from '../../main/modules/ProcessTodoTxtObjects';

type TodoTxtObjects = Record<string, any>;

const todoTxtObjects: TodoTxtObjects = 
[
  {
    id: 0,
    body: '+testProject test0 @testContext due:2023-06-03',
    created: '2023-11-30T23:00:00.000Z',
    complete: false,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject' ],
    due: '2023-06-03',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-12-01 +testProject test0 @testContext due:2023-06-03',
    group: null
  },
  {
    id: 1,
    body: 'test1 +testProject @testContext t:2023-01-02',
    created: '2023-11-30T23:00:00.000Z',
    complete: false,
    priority: 'B',
    contexts: [ 'testContext' ],
    projects: [ 'testProject' ],
    due: null,
    t: '2023-01-02',
    rec: null,
    tags: null,
    string: '(C) 2023-12-01 test1 +testProject @testContext t:2023-01-02',
    group: null
  },
  {
    id: 2,
    body: 'test2 +testProject @testContext due:2023-06-30',
    created: '2023-11-30T23:00:00.000Z',
    complete: true,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject' ],
    due: '2023-06-30',
    t: null,
    rec: null,
    tags: null,
    string: 'x (C) 2023-06-24 2023-12-01 test2 +testProject @testContext due:2023-06-30',
    group: null
  },
  {
    id: 3,
    body: 'test3 +testProject @testContext due:2023-06-02',
    created: '2023-06-23T22:00:00.000Z',
    complete: false,
    priority: 'A',
    contexts: [ 'testContext' ],
    projects: [ 'testProject' ],
    due: '2023-06-02',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-06-24 test3 +testProject @testContext due:2023-06-02',
    group: null
  }
];

let groupedTodoTxtObjects: any;

describe('Process todo.txt objects', () => {

    test('Objects are counted correctly', () => {
        const count = countTodoObjects(todoTxtObjects);
        expect(count).toEqual(4);
    });

    test('Search for "test3" result in 1 found object', () => {
        const searchString:string = 'test3';
        const results = applySearchString(searchString, todoTxtObjects);
        expect(results.length).toEqual(1);
    });

    test('Search for "lorem" result in 1 found object', () => {
        const searchString:string = 'lorem';
        const results = applySearchString(searchString, todoTxtObjects);
        expect(results.length).toEqual(0);
    });

    test('Function creates 3 groups (A, B, C)', () => {
        groupedTodoTxtObjects = groupTodoTxtObjects(todoTxtObjects, "priority");
        const groups = Object.keys(groupedTodoTxtObjects);
        expect(groups).toEqual(['C', 'B', 'A']);
    });

    test('Groups sorted asc', () => {
        const sortedGroups = sortGroups(groupedTodoTxtObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);
    });

    test('Groups sorting inverted', () => {
        const sortedGroups = sortGroups(groupedTodoTxtObjects, true);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['C', 'B', 'A']);
    });
});