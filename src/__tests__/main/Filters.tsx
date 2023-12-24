import { applyFilters } from '../../main/Modules/Filters/Filters';

describe('Should filter todos based on passed filters', () => {
  const todoObjects = [
    { id: 1, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-01-01', dueString: '2023-01-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    { id: 2, body: 'Test', created: null, complete: true, completed: null, priority: null, contexts: null, projects: ['Project 2'], due: '2023-02-01', dueString: '2023-02-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    { id: 3, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-03-01', dueString: '2023-03-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
  ];

  test('should return all todo objects if no filters are provided', () => {
    const filters = null;
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(todoObjects);
  });

  test('should filter todo objects based on project filter', () => {
    const filters = {
      projects: [ { value: 'Project 1', exclude: false } ]
    }
    const expected = [
      { id: 1, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-01-01', dueString: '2023-01-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
      { id: 3, body: 'Test', created: null, complete: false, completed: null, priority: null, contexts: null, projects: ['Project 1'], due: '2023-03-01', dueString: '2023-03-01', t: null, tString: null, rec: null, hidden: false, pm: null, string: '' },
    ];
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(expected);
  });

});