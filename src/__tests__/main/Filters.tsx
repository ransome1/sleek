import { applyFilters, createAttributesObject } from '../../main/modules/Filters';

describe('Should filter todos based on passed filters', () => {
  const todoObjects = [
    { id: 1, project: 'Project 1', due: '2023-01-01', complete: false },
    { id: 2, project: 'Project 2', due: '2023-02-01', complete: true },
    { id: 3, project: 'Project 1', due: '2023-03-01', complete: false },
  ];

  test('should return all todo objects if no filters are provided', () => {
    const filters = {};
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(todoObjects);
  });

  test('should filter todo objects based on project filter', () => {
    const filters = { project: [{ value: 'Project 1', exclude: false }] };
    const expected = [
      { id: 1, project: 'Project 1', due: '2023-01-01', complete: false },
      { id: 3, project: 'Project 1', due: '2023-03-01', complete: false },
    ];
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(expected);
  });

});

describe('Set of filters must create a respective set of attributes and its counts', () => {
  test('Should create attributes based on todo objects', () => {
    const todoObjects = [
      { id: 1, created: null, priority: 'A', projects: ['Project 1'], contexts: ['Context 1'], due: '2023-01-01', complete: false, completed: null, t: '2024-02-01', rec: null, pm: null },
      { id: 2, created: '2026-01-01', priority: null, projects: ['Project 2'], contexts: null, due: '2023-02-01', complete: false, completed: null, t: null, rec: null, pm: null },
      { id: 3, created: null, priority: null, projects: ['Project 1'], contexts: null, due: '2023-03-01', complete: false, completed: null, t: null, rec: '2b', pm: null },
      { id: 4, created: '2026-01-01', priority: 'C',projects: ['Project 2'], contexts: ['Context 1'], due: '2023-04-01', complete: false, completed: null, t: '2024-02-01', rec: null, pm: null },
    ];
    const expectedAttributes = {
      priority: { 'A': 1, 'C': 1 },
      projects: { 'Project 1': 2, 'Project 2': 2 },
      contexts: { 'Context 1': 2 },
      due: { '2023-01-01': 1, '2023-02-01': 1, '2023-03-01': 1, '2023-04-01': 1 },
      t: { '2024-02-01': 2 },
      rec: { '2b': 1 },
      pm: {},
      created: { '2026-01-01': 2 },
      completed: {},
    };
    const result = createAttributesObject(todoObjects);
    expect(result).toEqual(expectedAttributes);
  });

});
