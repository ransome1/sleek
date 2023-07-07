import { changeCompleteState } from '../../main/modules/TodoObject';
import { formatDate } from '../../main/util';
import { Item } from 'jsTodoTxt';

const date: string = formatDate(new Date());

jest.mock('../../main/modules/TodoObjects', () => {
  const todoObjectMock = [{
    id: 0,
    body: '+testProject5 test0 @testContext due:2023-01-02',
    complete: false,
    priority: 'C',
    contexts: ['testContext'],
    projects: ['testProject5'],
    due: '2023-01-02',
    t: null,
    rec: null,
    tags: null,
    string: '(C) +testProject5 test0 @testContext due:2023-01-02',
    group: null
  },{
    id: 1,
    body: '+testProject2 test1 @testContext due:2023-12-12',
    complete: true,
    completed: '2023-07-06T19:49:26.687Z',
    priority: 'C',
    contexts: ['testContext'],
    projects: ['testProject2'],
    due: '2023-12-12',
    t: null,
    rec: null,
    tags: null,
    string: 'x (C) 2023-07-06 2023-07-01 +testProject2 test1 @testContext due:2023-12-12',
    group: null
  }];

  return {
    todoObjects: todoObjectMock
  };
});

describe('Mark todo as complete', () => {
	test('Unfinished todo is being marked as complete', () => {
		const updatedTodoObject = changeCompleteState(0, true);
		expect(updatedTodoObject?.toString()).toEqual('x (C) ' + date + ' ' + date + ' +testProject5 test0 @testContext due:2023-01-02');
	});

	test('Finished todo is being marked as incomplete', () => {
		const updatedTodoObject = changeCompleteState(1, false);
		expect(updatedTodoObject?.toString()).toEqual('(C) 2023-07-01 +testProject2 test1 @testContext due:2023-12-12');
	});

	test('changeCompleteState throws an error for invalid parameters', () => {
	  expect(() => {
	    changeCompleteState(167, true);
	  }).toThrow('Invalid ID: ID must be between 0 and');
	});	

	// test('If no ID is passed, function will return null', () => {
	// 	const updatedTodoObject = changeCompleteState(-1, false);
	// 	expect(updatedTodoObject).toThrow('Invalid ID: ID must be between 0 and');
	// });
});