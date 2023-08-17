import dayjs from 'dayjs';
import { createTodoObjects } from '../../main/modules/CreateTodoObjects';
import { configStorage } from '../../main/config';

const dateTodayString: string = dayjs(new Date()).format('YYYY-MM-DD');

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn()
  },
}));

describe('Create todo objects', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create todo objects from file content', () => {
    const fileContent = `(B) Test +project @context todo 1 due:2022-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w\nx 2023-07-23 2023-07-21 Test todo 2\n`;
    const todoObjects = createTodoObjects(fileContent);

    expect(todoObjects).toHaveLength(2);
    expect(todoObjects[0]).toEqual({
      id: 0,
      body: 'Test +project @context todo 1 due:2022-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w',
      created: null,
      complete: false,
      completed: null,
      priority: "B",
      contexts: ['context', 'anotherContext'],
      projects: ['project'],
      due: '2022-12-31',
      t: '2024-03-24',
      rec: '+2w',
      hidden: true,
      pm: "4",
      string: '(B) Test +project @context todo 1 due:2022-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w',
    });
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
      t: null,
      rec: null,
      hidden: false,
      pm: null,
      string: 'x 2023-07-23 2023-07-21 Test todo 2',
    });
  });
});
