import { applyFilters, createAttributesObject } from '../../main/modules/Filters';

describe('applyFilters', () => {
  const todoObjects = [
    { id: 1, project: 'Project 1', due: '2023-01-01', completed: false },
    { id: 2, project: 'Project 2', due: '2023-02-01', completed: true },
    { id: 3, project: 'Project 1', due: '2023-03-01', completed: false },
  ];

  test('should return all todo objects if no filters are provided', () => {
    const filters = {};
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(todoObjects);
  });

  test('should filter todo objects based on project filter', () => {
    const filters = { project: [{ value: 'Project 1', exclude: false }] };
    const expected = [
      { id: 1, project: 'Project 1', due: '2023-01-01', completed: false },
      { id: 3, project: 'Project 1', due: '2023-03-01', completed: false },
    ];
    const result = applyFilters(todoObjects, filters);
    expect(result).toEqual(expected);
  });

});

describe('createAttributesObject', () => {
  test('should create attributes object with counts for each attribute', () => {
    const todoObjects = [
      { id: 1, priority: 'A', projects: ['Project 1'], contexts: ['Context 1'], due: '2023-01-01', completed: false, t: '2024-02-01', rec: null, pm: null },
      { id: 2, priority: null, projects: ['Project 2'], contexts: null, due: '2023-02-01', completed: true, t: null, rec: null, pm: null },
      { id: 3, priority: null, projects: ['Project 1'], contexts: null, due: '2023-03-01', completed: false, t: null, rec: '2b', pm: null },
      { id: 4, priority: 'C',projects: ['Project 2'], contexts: ['Context 1'], due: '2023-04-01', completed: false, t: '2024-02-01', rec: null, pm: null },
    ];
    const expectedAttributes = {
      priority: { 'A': 1, 'C': 1 },
      projects: { 'Project 1': 2, 'Project 2': 2 },
      contexts: { 'Context 1': 2 },
      due: { '2023-01-01': 1, '2023-02-01': 1, '2023-03-01': 1, '2023-04-01': 1 },
      t: { '2024-02-01': 2 },
      rec: { '2b': 1 },
      pm: {},
    };
    const result = createAttributesObject(todoObjects);
    expect(result).toEqual(expectedAttributes);
  });

});
