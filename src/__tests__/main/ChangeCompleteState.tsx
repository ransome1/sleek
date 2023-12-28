import { changeCompleteState } from '../../main/modules/ProcessDataRequest/ChangeCompleteState';
import dayjs from 'dayjs';

const date: string = dayjs(new Date()).format('YYYY-MM-DD');

jest.mock('../../main/modules/ProcessDataRequest/CreateRecurringTodo', () => ({
  createRecurringTodo: jest.fn(),
}));

describe('Marking todo as complete and vice versa', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

	test('Unfinished todo is being marked as complete', async () => {
		const updatedTodoObject = await changeCompleteState('(C) +testProject5 test0 @testContext due:2023-01-02', true);
		expect(updatedTodoObject?.toString()).toEqual('x ' + date + ' ' + date + ' +testProject5 test0 @testContext due:2023-01-02 pri:C');
	});

	test('Finished todo is being marked as incomplete', async () => {
		const updatedTodoObject = await changeCompleteState('x 2023-07-06 2023-07-01 +testProject2 test1 @testContext due:2023-12-12 pri:C', false);
		expect(updatedTodoObject?.toString()).toEqual('(C) 2023-07-01 +testProject2 test1 @testContext due:2023-12-12 pri:C');
	});

});