import { sortAndGroupTodoObjects, flattenTodoObjects, applySearchString, countTodoObjects } from '../../main/Modules/ProcessDataRequest/ProcessTodoObjects';

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      {
        active: true,
        path: './src/__tests__/__mock__',
        todoFilePath: 'recurrence.txt',
        todoFileBookmark: null,
        doneFilePath: 'done.txt',
        doneFileBookmark: null,
      },
    ]),
  },
}));  

const sorting = [
    {
        "id": "1",
        "value": "priority",
        "invert": false
    },
    {
        "id": "2",
        "value": "due",
        "invert": false
    },
    {
        "id": "3",
        "value": "projects",
        "invert": false
    },
    {
        "id": "4",
        "value": "contexts",
        "invert": false
    },
    {
        "id": "5",
        "value": "created",
        "invert": false
    },
    {
        "id": "6",
        "value": "t",
        "invert": false
    },
    {
        "id": "7",
        "value": "completed",
        "invert": false
    }
]

const todoObjects: any = 
[
  {
    id: 0,
    body: '+testProject5 test0 @testContext due:2023-01-02',
    created: '2025-12-09',
    complete: false,
    completed: null,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject5' ],
    due: '2023-01-02',
    t: null,
    rec: null,
    hidden: false,
    pm: null,
    string: '(C) 2025-12-09 +testProject5 test0 @testContext due:2023-01-02',
  },
  {
    id: 1,
    body: 'test1 +testProject7 @testContext7 t:2023-12-15',
    created: '2023-12-01',
    complete: false,
    completed: null,
    priority: 'B',
    contexts: [ 'testContext7' ],
    projects: [ 'testProject7' ],
    due: null,
    t: '2023-12-15',
    rec: null,
    hidden: false,
    pm: null,    
    string: '(B) 2023-12-01 test1 +testProject7 @testContext7 t:2023-12-15',
  },
  {
    id: 2,
    body: 'test2 +testProject1 @testContext due:2023-01-01',
    created: '2025-12-08',
    complete: true,
    completed: null,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject1' ],
    due: '2023-01-01',
    t: null,
    rec: null,
    hidden: false,
    pm: null,    
    string: 'x (C) 2025-12-08 2023-12-01 test2 +testProject1 @testContext due:2023-01-01',
  },
  {
    id: 3,
    body: 'test3 +testProject6 @testContext6 due:2023-12-03',
    created: '2023-06-24',
    complete: false,
    completed: null,
    priority: 'A',
    contexts: [ 'testContext6' ],
    projects: [ 'testProject6' ],
    due: '2023-12-03',
    t: null,
    rec: null,
    hidden: false,
    pm: null,    
    string: '(A) 2023-06-24 test3 +testProject6 @testContext6 due:2023-12-03',
  },
  {
    id: 4,
    body: 'test3 +testProject3 @testContext due:2023-01-03',
    created: '2025-12-06',
    complete: false,
    completed: null,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject3' ],
    due: '2023-01-03',
    t: null,
    rec: null,
    hidden: false,
    pm: null,    
    string: '(C) 2025-12-06 test3 +testProject3 @testContext due:2023-01-03',
  },
  {
    id: 5,
    body: 'test3 +testProject2 @testContext due:2023-01-05',
    created: '2025-12-05',
    complete: false,
    completed: null,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject2' ],
    due: '2023-01-05',
    t: null,
    rec: null,
    hidden: false,
    pm: null,
    string: '(C) 2025-12-05 test3 +testProject2 @testContext due:2023-01-05',
  },
  {
    id: 6,
    body: 'test3 +testProject4 @testContext due:2023-01-04',
    created: '2025-12-07',
    complete: false,
    completed: null,
    priority: 'C',
    contexts: [ 'testContext' ],
    projects: [ 'testProject4' ],
    due: '2023-01-04',
    t: null,
    rec: null,
    hidden: false,
    pm: null,    
    string: '(C) 2025-12-07 test3 +testProject4 @testContext due:2023-01-04'
  }  
];

let groupedTodoObjects: any;

describe('Process todo.txt objects', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });    

    test('Objects are counted correctly', () => {
        const count: number = countTodoObjects(todoObjects, true);
        expect(count).toEqual(1);
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

    test('Advanced search for "+testProject4 or +testProject2" result in 2 found objects', () => {
        const searchString:string = '+testProject4 or +testProject2';
        const results = applySearchString(searchString, todoObjects);
        expect(results.length).toEqual(2);
    });

    test('Advanced search for "+testProject4 and +testProject2" result in 0 found objects', () => {
        const searchString:string = '+testProject4 and +testProject2';
        const results = applySearchString(searchString, todoObjects);
        expect(results.length).toEqual(0);
    });

    test('Advanced search for "+testProject4 and !+testProject2" result in 1 found objects', () => {
        const searchString:string = '+testProject4 and !+testProject2';
        const results = applySearchString(searchString, todoObjects);
        expect(results.length).toEqual(1);
    });

    test('Function creates 3 top level groups (A, B, C)', () => {
        const sortedAndGroupedTodoObjects = sortAndGroupTodoObjects(todoObjects, sorting);
        const groups = Object.keys(sortedAndGroupedTodoObjects);
        expect(groups).toEqual(['A', 'B', 'C']);
    });

    test('Top level group sorted asc', () => {
        sorting[0].invert = true;
        const sortedAndGroupedTodoObjects = sortAndGroupTodoObjects(todoObjects, sorting);
        const groups = Object.keys(sortedAndGroupedTodoObjects);
        expect(groups).toEqual(['C', 'B', 'A']);
    });

    test('Sorting: Priority -> Due dates ', () => {
        sorting[0].invert = false;
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

        expect(flattenedObjects[5].due).toContain('2023-01-01');
        expect(flattenedObjects[6].due).toContain('2023-01-02');
        expect(flattenedObjects[7].due).toContain('2023-01-03');
        expect(flattenedObjects[8].due).toContain('2023-01-04');
        expect(flattenedObjects[9].due).toContain('2023-01-05');
    });

    test('Sorting: Priority -> Projects ', () => {
        sorting[0].invert = false;
        sorting[1].value = 'projects';
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

        expect(flattenedObjects[5].projects[0]).toContain('testProject1');
        expect(flattenedObjects[6].projects[0]).toContain('testProject2');
        expect(flattenedObjects[7].projects[0]).toContain('testProject3');
        expect(flattenedObjects[8].projects[0]).toContain('testProject4');
        expect(flattenedObjects[9].projects[0]).toContain('testProject5');
    });

    test('Sorting: Priority -> Projects, but inverted ', () => {
        sorting[1].invert = true;
        sorting[1].value = 'projects';
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

        expect(flattenedObjects[5].projects[0]).toContain('testProject5');
        expect(flattenedObjects[6].projects[0]).toContain('testProject4');
        expect(flattenedObjects[7].projects[0]).toContain('testProject3');
        expect(flattenedObjects[8].projects[0]).toContain('testProject2');
        expect(flattenedObjects[9].projects[0]).toContain('testProject1');
    });

    test('Sorting: Priority -> Contexts -> Creation', () => {
        sorting[1].invert = false;
        sorting[1].value = 'contexts';
        sorting[2].value = 'creation';
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

        expect(flattenedObjects[5].created).toContain('2025-12-05');
        expect(flattenedObjects[6].created).toContain('2025-12-06');
        expect(flattenedObjects[7].created).toContain('2025-12-07');
        expect(flattenedObjects[8].created).toContain('2025-12-08');
        expect(flattenedObjects[9].created).toContain('2025-12-09');
    });

    test('Sorting: Priority -> Contexts -> Projects (inverted)', () => {
        sorting[1].invert = false;
        sorting[1].value = 'contexts';
        sorting[2].value = 'projects';
        sorting[2].invert = true;
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

        expect(flattenedObjects[5].projects[0]).toContain('testProject5');
        expect(flattenedObjects[6].projects[0]).toContain('testProject4');
        expect(flattenedObjects[7].projects[0]).toContain('testProject3');
        expect(flattenedObjects[8].projects[0]).toContain('testProject2');
        expect(flattenedObjects[9].projects[0]).toContain('testProject1');
    });    

    test('Sorting: Contexts -> Projects, but inverted ', () => {
        sorting[0].invert = false;
        sorting[0].value = 'contexts';
        sorting[1].invert = true;
        sorting[1].value = 'projects';
        const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
        const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "contexts")

        expect(flattenedObjects[1].projects[0]).toContain('testProject5');
        expect(flattenedObjects[2].projects[0]).toContain('testProject4');
        expect(flattenedObjects[3].projects[0]).toContain('testProject3');
        expect(flattenedObjects[4].projects[0]).toContain('testProject2');
        expect(flattenedObjects[5].projects[0]).toContain('testProject1');
    });       
 
});