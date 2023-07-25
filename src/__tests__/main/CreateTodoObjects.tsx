import dayjs from 'dayjs';
import { createTodoObjects } from '../../main/modules/CreateTodoObjects';
import { configStorage } from '../../main/config';

const completionDate = dayjs('2023-07-23').toDate();
const creationDate = dayjs('2023-07-21').toDate()
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
      hidden: "1",
      pm: "4",
      string: '(B) Test +project @context todo 1 due:2022-12-31 t:2024-03-24 h:1 test @anotherContext pm:4 and a strict rec:+2w',
      group: null,
    });
    expect(todoObjects[1]).toEqual({
      id: 1,
      body: 'Test todo 2',
      created: creationDate,
      complete: true,
      completed: completionDate,
      priority: null,
      contexts: [],
      projects: [],
      due: null,
      t: null,
      rec: null,
      hidden: null,
      pm: null,
      string: 'x 2023-07-23 2023-07-21 Test todo 2',
      group: null,
    });
  });

  test('should create a todo object with the creation date appended', () => {
    jest.spyOn(configStorage, 'get').mockReturnValue({ appendCreationDate: true });
    
    const fileContent = `Test`;
    const todoObjects = createTodoObjects(fileContent);

    expect(todoObjects).toHaveLength(1);
    expect(todoObjects[0]).toEqual({
      id: 0,
      body: 'Test',
      created: new Date(),
      complete: false,
      completed: null,
      priority: null,
      contexts: [],
      projects: [],
      due: null,
      t: null,
      rec: null,
      hidden: null,
      pm: null,
      string: `${dateTodayString} Test`,
      group: null,
    });
  });  
});
