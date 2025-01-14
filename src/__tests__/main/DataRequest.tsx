import fs from 'fs';
import { createTodoObjects } from '../../main/modules/DataRequest/CreateTodoObjects';
import { applySearchString } from '../../main/modules/Filters/Search';
import { sortAndGroupTodoObjects } from '../../main/modules/DataRequest/SortAndGroup';

jest.mock('../../main/config', () => ({
  config: {
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

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn()
  },
}));

jest.mock('electron', () => ({
  app: {
    setBadgeCount: jest.fn(),
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

let todoObjects: TodoObject[];
let fileContent: string;

describe('Process todo.txt objects', () => {

    beforeAll(() => {
        jest.clearAllMocks();
        fileContent = fs.readFileSync('./src/__tests__/__mock__/todo.txt', 'utf8');
        todoObjects = createTodoObjects(fileContent);
    });

    beforeEach(() => {
        todoObjects = createTodoObjects(fileContent);
    });

    test('Search for "test3"', () => {
        const searchString: string = 'test3';
        todoObjects = applySearchString(searchString, todoObjects);
        // const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
        //     return todoObject.visible;
        // });
        expect(todoObjects.length).toEqual(4);
    });

    test('Search for "lorem"', () => {
        const searchString: string = 'lorem';
        todoObjects = applySearchString(searchString, todoObjects);
        // const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
        //     return todoObject.visible;
        // });
        expect(todoObjects.length).toEqual(0);
    });

    test('Advanced search for "+testProject4 or +testProject2"', () => {
        const searchString: string = '+testProject4 or +testProject2';
        todoObjects = applySearchString(searchString, todoObjects);
        // const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
        //     return todoObject.visible;
        // });
        expect(todoObjects.length).toEqual(2);
    });

    test('Advanced search for "+testProject4 and +testProject2" result in 0 found objects', () => {
        const searchString:string = '+testProject4 and +testProject2';
        todoObjects = applySearchString(searchString, todoObjects);
        // const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
        //     return todoObject.visible;
        // });
        expect(todoObjects.length).toEqual(0);
    });

    test('Advanced search for "+testProject4 and !+testProject2" result in 1 found objects', () => {
        const searchString:string = '+testProject4 and !+testProject2';
        todoObjects = applySearchString(searchString, todoObjects);
        // const visibleTodoObjects: TodoObject[] = todoObjects.filter((todoObject: TodoObject) => {
        //     return todoObject.visible;
        // });
        expect(todoObjects.length).toEqual(1);
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

    // test('Sorting: Priority -> Due dates ', () => {
    //     sorting[0].invert = false;
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")
    //     expect(flattenedObjects[2].due).toContain('2023-01-01');
    //     expect(flattenedObjects[3].due).toContain('2023-01-02');
    //     expect(flattenedObjects[4].due).toContain('2023-01-03');
    //     expect(flattenedObjects[5].due).toContain('2023-01-04');
    //     expect(flattenedObjects[6].due).toContain('2025-01-05');
    // });

    // test('Sorting: Priority -> Projects ', () => {
    //     sorting[0].invert = false;
    //     sorting[1].value = 'projects';
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

    //     expect(flattenedObjects[2].projects[0]).toContain('testProject1');
    //     expect(flattenedObjects[3].projects[0]).toContain('testProject2');
    //     expect(flattenedObjects[4].projects[0]).toContain('testProject3');
    //     expect(flattenedObjects[5].projects[0]).toContain('testProject4');
    //     expect(flattenedObjects[6].projects[0]).toContain('testProject5');
    // });

    // test('Sorting: Priority -> Projects, but inverted ', () => {
    //     sorting[1].invert = true;
    //     sorting[1].value = 'projects';
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

    //     expect(flattenedObjects[2].projects[0]).toContain('testProject5');
    //     expect(flattenedObjects[3].projects[0]).toContain('testProject4');
    //     expect(flattenedObjects[4].projects[0]).toContain('testProject3');
    //     expect(flattenedObjects[5].projects[0]).toContain('testProject2');
    //     expect(flattenedObjects[6].projects[0]).toContain('testProject1');
    // });

    // test('Sorting: Priority -> Contexts -> Creation', () => {
    //     sorting[1].invert = false;
    //     sorting[1].value = 'contexts';
    //     sorting[2].value = 'creation';
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

    //     expect(flattenedObjects[3].created).toContain('2025-12-05');
    //     expect(flattenedObjects[4].created).toContain('2025-12-06');
    //     expect(flattenedObjects[5].created).toContain('2025-12-07');
    //     expect(flattenedObjects[6].created).toContain('2025-12-09');
    // });

    // test('Sorting: Priority -> Contexts -> Projects (inverted)', () => {
    //     sorting[1].invert = false;
    //     sorting[1].value = 'contexts';
    //     sorting[2].value = 'projects';
    //     sorting[2].invert = true;
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "priority")

    //     expect(flattenedObjects[2].projects[0]).toContain('testProject5');
    //     expect(flattenedObjects[3].projects[0]).toContain('testProject4');
    //     expect(flattenedObjects[4].projects[0]).toContain('testProject3');
    //     expect(flattenedObjects[5].projects[0]).toContain('testProject2');
    //     expect(flattenedObjects[6].projects[0]).toContain('testProject1');
    // });    

    // test('Sorting: Contexts -> Projects, but inverted ', () => {
    //     sorting[0].invert = false;
    //     sorting[0].value = 'contexts';
    //     sorting[1].invert = true;
    //     sorting[1].value = 'projects';
    //     const sortedAndGrouped: any = sortAndGroupTodoObjects(todoObjects, sorting);
    //     const flattenedObjects: any = flattenTodoObjects(sortedAndGrouped, "contexts")

    //     expect(flattenedObjects[0].projects[0]).toContain('testProject5');
    //     expect(flattenedObjects[1].projects[0]).toContain('testProject4');
    //     expect(flattenedObjects[2].projects[0]).toContain('testProject3');
    //     expect(flattenedObjects[3].projects[0]).toContain('testProject2');
    //     expect(flattenedObjects[4].projects[0]).toContain('testProject1');
    // });    
 
});