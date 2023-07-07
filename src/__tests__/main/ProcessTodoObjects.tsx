import { sortGroups, groupTodoObjects, sortTodoObjects, applySearchString, countTodoObjects } from '../../main/modules/ProcessTodoObjects';

type todoObjects = Record<string, any>;

const todoObjects: todoObjects = 
[
  {
    id: 0,
    body: '+testProject5 test0 @testContext due:2023-01-02',
    created: '2023-11-30T23:00:00.000Z',
    complete: false,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject5' ],
    due: '2023-01-02',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-12-01 +testProject5 test0 @testContext due:2023-01-02',
    group: null
  },
  {
    id: 1,
    body: 'test1 +testProject7 @testContext7 t:2023-12-15',
    created: '2023-11-30T23:00:00.000Z',
    complete: false,
    priority: 'B',
    contexts: [ 'testContext7' ],
    projects: [ 'testProject7' ],
    due: null,
    t: '2023-12-15',
    rec: null,
    tags: null,
    string: '(B) 2023-12-01 test1 +testProject7 @testContext7 t:2023-12-15',
    group: null
  },
  {
    id: 2,
    body: 'test2 +testProject1 @testContext due:2023-01-01',
    created: '2023-11-30T23:00:00.000Z',
    complete: true,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject1' ],
    due: '2023-01-01',
    t: null,
    rec: null,
    tags: null,
    string: 'x (C) 2023-06-24 2023-12-01 test2 +testProject1 @testContext due:2023-01-01',
    group: null
  },
  {
    id: 3,
    body: 'test3 +testProject6 @testContext6 due:2023-12-03',
    created: '2023-06-23T22:00:00.000Z',
    complete: false,
    priority: 'A',
    contexts: [ 'testContext6' ],
    projects: [ 'testProject6' ],
    due: '2023-12-03',
    t: null,
    rec: null,
    tags: null,
    string: '(A) 2023-06-24 test3 +testProject6 @testContext6 due:2023-12-03',
    group: null
  },
  {
    id: 4,
    body: 'test3 +testProject3 @testContext due:2023-01-03',
    created: '2023-06-23T22:00:00.000Z',
    complete: false,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject3' ],
    due: '2023-01-03',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-06-24 test3 +testProject3 @testContext due:2023-01-03',
    group: null
  },
  {
    id: 5,
    body: 'test3 +testProject2 @testContext due:2023-01-05',
    created: '2023-06-23T22:00:00.000Z',
    complete: false,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject2' ],
    due: '2023-01-05',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-06-24 test3 +testProject2 @testContext due:2023-01-05',
    group: null
  },
  {
    id: 6,
    body: 'test3 +testProject4 @testContext due:2023-01-04',
    created: '2023-06-23T22:00:00.000Z',
    complete: false,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject4' ],
    due: '2023-01-04',
    t: null,
    rec: null,
    tags: null,
    string: '(C) 2023-06-24 test3 +testProject4 @testContext due:2023-01-04',
    group: null
  }  
];

let groupedTodoObjects: any;

describe('Process todo.txt objects', () => {

    test('Objects are counted correctly', () => {
        const count = countTodoObjects(todoObjects);
        expect(count).toEqual(7);
    });

    test('Search for "test3" result in 1 found object', () => {
        const searchString:string = 'test3';
        const results = applySearchString(searchString, todoObjects);
        expect(results.length).toEqual(4);
    });

    test('Search for "lorem" result in 1 found object', () => {
        const searchString:string = 'lorem';
        const results = applySearchString(searchString, todoObjects);
        expect(results.length).toEqual(0);
    });

    test('Function creates 3 groups (A, B, C)', () => {
        groupedTodoObjects = groupTodoObjects(todoObjects, "priority");
        const groups = Object.keys(groupedTodoObjects);
        expect(groups).toEqual(['C', 'B', 'A']);
    });

    test('Groups sorted asc', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);
    });

    test('Groups sorting inverted', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, true);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['C', 'B', 'A']);
    });

    test('Sorting: Priority -> Due dates ', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);
        const sorting = [
            "priority",
            "due",
            "projects",
            "contexts",
            "t",
            "completed",
            "created"
        ]
        const sortedObjects = sortTodoObjects(sortedGroups, sorting, false, false);
        const entriesForPriorityC = Object.entries(sortedObjects)[2];
        expect(entriesForPriorityC[1][0].due).toEqual('2023-01-01');
        expect(entriesForPriorityC[1][1].due).toEqual('2023-01-02');
        expect(entriesForPriorityC[1][2].due).toEqual('2023-01-03');
        expect(entriesForPriorityC[1][3].due).toEqual('2023-01-04');
        expect(entriesForPriorityC[1][4].due).toEqual('2023-01-05');
    });

    test('Sorting: Priority -> Projects', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);

        const sorting = [
            "priority",
            "projects",
            "due",
            "contexts",
            "t",
            "completed",
            "created"
        ]
        const sortedObjects = sortTodoObjects(sortedGroups, sorting, false, false);
        const entriesForPriorityC = Object.entries(sortedObjects)[2];
        expect(entriesForPriorityC[1][0].projects[0]).toEqual('testProject1');
        expect(entriesForPriorityC[1][1].projects[0]).toEqual('testProject2');
        expect(entriesForPriorityC[1][2].projects[0]).toEqual('testProject3');
        expect(entriesForPriorityC[1][3].projects[0]).toEqual('testProject4');
        expect(entriesForPriorityC[1][4].projects[0]).toEqual('testProject5');
    });

    test('Sorting: Priority -> Projects but inverted', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);

        const sorting = [
            "priority",
            "projects",
            "due",
            "contexts",
            "t",
            "completed",
            "created"
        ]
        const sortedObjects = sortTodoObjects(sortedGroups, sorting, true, false);
        const entriesForPriorityC = Object.entries(sortedObjects)[2];
        expect(entriesForPriorityC[1][0].projects[0]).toEqual('testProject5');
        expect(entriesForPriorityC[1][1].projects[0]).toEqual('testProject4');
        expect(entriesForPriorityC[1][2].projects[0]).toEqual('testProject3');
        expect(entriesForPriorityC[1][3].projects[0]).toEqual('testProject2');
        expect(entriesForPriorityC[1][4].projects[0]).toEqual('testProject1');
    });

    test('Sorting: Priority -> Contexts -> Projects', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);

        const sorting = [
            "priority",
            "contexts",
            "due",
            "projects",
            "t",
            "completed",
            "created"
        ]
        const sortedObjects = sortTodoObjects(sortedGroups, sorting, false, false);
        const entriesForPriorityC = Object.entries(sortedObjects)[2];
        expect(entriesForPriorityC[1][0].due).toEqual('2023-01-01');
        expect(entriesForPriorityC[1][1].due).toEqual('2023-01-02');
        expect(entriesForPriorityC[1][2].due).toEqual('2023-01-03');
    });

    test('Sorting completed last: Priority -> Contexts', () => {
        const sortedGroups = sortGroups(groupedTodoObjects, false);
        const groups = Object.keys(sortedGroups);
        expect(groups).toEqual(['A', 'B', 'C']);

        const sorting = [
            "priority",
            "contexts",
            "due",
            "projects",
            "t",
            "completed",
            "created"
        ]
        const sortedObjects = sortTodoObjects(sortedGroups, sorting, false, true);
        const entriesForPriorityC = Object.entries(sortedObjects)[2];
        const lastEntry = entriesForPriorityC[1].pop();
        expect(lastEntry.complete).toEqual(true);
    });    
});