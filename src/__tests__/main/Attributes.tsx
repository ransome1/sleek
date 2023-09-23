import { attributes, updateAttributes } from '../../main/modules/Attributes';
import { Attributes } from '../../main/util';

const todoObjects = [
  { id: 1, created: null, priority: 'A', projects: ['Project 1'], contexts: ['Context 1'], due: '2023-01-01', dueString: '2023-01-01', complete: false, completed: null, t: '2024-02-01', tString: '2024-02-01', rec: null, pm: null, body: null, hidden: false, string: '' },
  { id: 2, created: '2026-01-01', priority: null, projects: ['Project 2'], contexts: null, due: '2023-02-01', dueString: '2023-02-01', complete: false, completed: null, t: null, tString: null, rec: null, pm: null, body: null, hidden: false, string: '' },
  { id: 3, created: null, priority: null, projects: ['Project 1'], contexts: null, due: '2023-03-01', dueString: '2023-03-01', complete: false, completed: null, t: null, tString: null, rec: '2b', pm: null, body: null, hidden: false, string: '' },
  { id: 4, created: '2026-01-01', priority: 'C',projects: ['Project 2'], contexts: ['Context 1'], due: '2023-04-01', dueString: '2023-04-01', complete: false, completed: null, t: '2024-02-01', tString: '2024-02-01', rec: null, pm: null, body: null, hidden: false, string: '' },
];

describe('Set of filters must create a respective set of attributes and its counts', () => {
  test('Should create attributes based on todo objects', () => {
    
    const sorting = [
      { id: '1', value: 'priority', invert: false },
      { id: '2', value: 'projects', invert: false },
      { id: '3', value: 'contexts', invert: false },
      { id: '4', value: 'due', invert: false },
      { id: '5', value: 't', invert: false },
      { id: '6', value: 'completed', invert: false },
      { id: '7', value: 'created', invert: false },
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
    
    console.log(attributes)

    updateAttributes(todoObjects, sorting, true);

    console.log(attributes)
    expect(attributes).toEqual(expectedAttributes);
  });

  // test('Should create attributes in a specific order based on todo objects', () => {

  //   const sorting = [
  //     { id: '2', value: 'projects', invert: false },
  //     { id: '1', value: 'priority', invert: false },
  //     { id: '7', value: 'created', invert: false },
  //     { id: '4', value: 'due', invert: false },
  //     { id: '5', value: 't', invert: false },
  //     { id: '3', value: 'contexts', invert: false },
  //     { id: '6', value: 'completed', invert: false },      
  //   ];

  //   const expectedAttributes = {
  //     projects: { 'Project 1': 2, 'Project 2': 2 },
  //     priority: { 'A': 1, 'C': 1 },
  //     created: { '2026-01-01': 2 },
  //     due: { '2023-01-01': 1, '2023-02-01': 1, '2023-03-01': 1, '2023-04-01': 1 },
  //     rec: { '2b': 1 },
  //     pm: {},
  //     t: { '2024-02-01': 2 },
  //     contexts: { 'Context 1': 2 },
  //     completed: {},
  //   };
  //   //const result = updateAttributes(todoObjects, sorting, false);
  //   updateAttributes(todoObjects, sorting, true);
  //   expect(attributes).toEqual(expectedAttributes);
  // });  

});