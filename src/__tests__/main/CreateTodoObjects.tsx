import { createTodoObjects } from '../../main/modules/ProcessDataRequest/CreateTodoObjects';

jest.mock('electron', () => ({
  app: {
    setBadgeCount: jest.fn(),
  },
}));

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn()
  },
}));

const fileContent = `(B) Test +project @context todo 1 due:2023-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w\nx 2023-07-23 2023-07-21 Test todo 2\nTest todo 3 due:end of the year\nTest todo 4 t:first day of next year`;

describe('Create todo objects', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create 4 todo objects', async () => {
    const todoObjects = await createTodoObjects(fileContent);
    expect(todoObjects).toHaveLength(4);
  });
  
  test('should create a todo object', async () => {
    const todoObjects = await createTodoObjects(fileContent);
    expect(todoObjects[0]).toEqual({
      id: 0,
      body: 'Test +project @context todo 1 due:2023-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w',
      created: null,
      complete: false,
      completed: null,
      priority: "B",
      contexts: ['context', 'anotherContext'],
      projects: ['project'],
      due: '2023-12-31',
      dueString: '2023-12-31',
      t: '2024-03-24',
      tString: '2024-03-24',
      rec: '+2w',
      hidden: true,
      pm: "4",
      string: '(B) Test +project @context todo 1 due:2023-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w',
      notify: false,
      visible: true,
    });
  });

  test('should create a finished todo object', async () => {
    const todoObjects = await createTodoObjects(fileContent);
    expect(todoObjects[1]).toEqual({
      id: 1,
      body: 'Test todo 2',
      created: '2023-07-21',
      complete: true,
      completed: '2023-07-23',
      priority: null,
      contexts: [],
      projects: [],
      due: null,
      dueString: null,
      t: null,
      tString: null,
      rec: null,
      hidden: false,
      pm: null,
      string: 'x 2023-07-23 2023-07-21 Test todo 2',
      notify: false,
      visible: true,
    });
  });

  test('should create a todo object with speaking due date', async () => {
    const todoObjects = await createTodoObjects(fileContent);
    expect(todoObjects[2]).toEqual({
      id: 2,
      body: 'Test todo 3 due:end of the year',
      created: null,
      complete: false,
      completed: null,
      priority: null,
      contexts: [],
      projects: [],
      due: '2024-12-31',
      dueString: 'end of the year',
      t: null,
      tString: null,
      rec: null,
      hidden: false,
      pm: null,
      string: 'Test todo 3 due:end of the year',
      notify: false,
      visible: true,
    });    
  });

  test('should create a todo object with speaking t date', async () => {
    const todoObjects = await createTodoObjects(fileContent);
    expect(todoObjects[3]).toEqual({
      id: 3,
      body: 'Test todo 4 t:first day of next year',
      created: null,
      complete: false,
      completed: null,
      priority: null,
      contexts: [],
      projects: [],
      due: null,
      dueString: null,
      t: '2025-01-01',
      tString: 'first day of next year',
      rec: null,
      hidden: false,
      pm: null,
      string: 'Test todo 4 t:first day of next year',
      notify: false,
      visible: true,
    });    
  });
});
