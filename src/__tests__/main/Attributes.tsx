import { attributes, updateAttributes } from '../../main/Modules/Attributes';

const todoObjects = [
  { id: 1, created: null, priority: 'A', projects: ['Project 1'], contexts: ['Context 1'], due: '2023-01-01', dueString: '2023-01-01', complete: false, completed: null, t: '2024-02-01', tString: '2024-02-01', rec: null, pm: null, body: null, hidden: false, string: '', notify: false, },
  { id: 2, created: '2026-01-01', priority: null, projects: ['Project 2'], contexts: null, due: '2023-02-01', dueString: '2023-02-01', complete: false, completed: null, t: null, tString: null, rec: null, pm: null, body: null, hidden: false, string: '', notify: false, },
  { id: 3, created: null, priority: null, projects: ['Project 1'], contexts: null, due: '2023-03-01', dueString: '2023-03-01', complete: false, completed: null, t: null, tString: null, rec: '2b', pm: null, body: null, hidden: false, string: '', notify: true, },
  { id: 4, created: '2026-01-01', priority: 'C', projects: ['Project 2'], contexts: ['Context 1'], due: '2023-04-01', dueString: '2023-04-01', complete: false, completed: null, t: '2024-02-01', tString: '2024-02-01', rec: null, pm: null, body: null, hidden: false, string: '', notify: false, },
];

describe('Set of filters must create a respective set of attributes and its counts', () => {
  test('Should create attributes based on todo objects', async () => {

    const sorting = [
      { id: '1', value: 'priority', invert: false },
      { id: '2', value: 'projects', invert: false },
      { id: '3', value: 'contexts', invert: false },
      { id: '4', value: 'due', invert: false },
      { id: '5', value: 't', invert: false },
      { id: '6', value: 'completed', invert: false },
      { id: '7', value: 'created', invert: false },
      { id: '8', value: 'rec', invert: false },
      { id: '9', value: 'pm', invert: false },
    ];

    const expectedAttributes = {
      priority: { 'A': { count: 1, notify: false}, 'C': { count: 1, notify: false} },
      projects: { 'Project 1': { count: 2, notify: false}, 'Project 2': { count: 2, notify: false} },
      contexts: { 'Context 1': { count: 2, notify: false} },
      due: { '2023-01-01': { count: 1, notify: false}, '2023-02-01': { count: 1, notify: false}, '2023-03-01': { count: 1, notify: true}, '2023-04-01': { count: 1, notify: false} },
      t: { '2024-02-01': { count: 2, notify: false} },
      rec: { '2b': { count: 1, notify: false} },
      pm: {},
      created: { '2026-01-01': { count: 2, notify: false} },
      completed: {},
    };
    await updateAttributes(todoObjects, sorting, false);
    expect(attributes).toEqual(expectedAttributes);
  });

});
