import { applyAttributes } from '../../main/modules/Filters/Filters';

jest.mock('../../main/config', () => ({
  config: {
    get: jest.fn()
  },
}));

describe('Should filter todos based on passed filters', () => {
  const todoObjects = [
    { lineNumber: 1, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-01-01', dueString: '2023-01-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    { lineNumber: 2, body: 'Test', created: null, complete: true, completed: null, priority: null, contexts: null, projects: ['Project 2'], due: '2023-02-01', dueString: '2023-02-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    { lineNumber: 3, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-03-01', dueString: '2023-03-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
  ];

  test('should return all todo objects if no filters are provided', () => {
    const filters = null;
    const result = applyAttributes(todoObjects, filters);
    expect(result).toEqual(todoObjects);
  });

  test('should filter todo objects based on project filter', () => {
    const filters = {
      projects: [ { values: ['Project 1'], exclude: false } ]
    };
    const expected = [
      { lineNumber: 1, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-01-01', dueString: '2023-01-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
      { lineNumber: 3, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-03-01', dueString: '2023-03-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    ];
    const result = applyAttributes(todoObjects, filters);
    expect(result).toEqual(expected);
  });

});