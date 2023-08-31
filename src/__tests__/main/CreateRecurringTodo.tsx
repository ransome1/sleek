import fs from 'fs/promises';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import { createRecurringTodo } from '../../main/modules/CreateRecurringTodo';
import { getActiveFile } from '../../main/modules/ActiveFile';
import { lines } from '../../main/modules/CreateTodoObjects';
import dayjs from 'dayjs';

jest.mock('../../main/modules/CreateTodoObjects', () => ({
  lines: [''],
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      {
        active: true,
        path: './src/__tests__/__mock__',
        todoFile: 'recurrence.txt',
        doneFile: 'done.txt',
      },
    ]),
  },
}));  

const dateToday = dayjs(new Date());
const dateTodayString = dayjs(dateToday).format('YYYY-MM-DD');
const dateTomorrowString = dateToday.add(1, 'day').format('YYYY-MM-DD');
const dateDayAfterTomorrowString = dateToday.add(2, 'day').format('YYYY-MM-DD');
const dateInOneWeek = dateToday.add(7, 'day').format('YYYY-MM-DD');
const dateTodayInTwoMonths = dateToday.add(2, 'month').format('YYYY-MM-DD');
const dateTodayInSevenWeeks = dateToday.add(7, 'week').format('YYYY-MM-DD');

describe('Create recurring todos', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    fs.writeFile('./src/__tests__/__mock__/recurrence.txt', '');
  });

  test('Should add a new todo with due date set to tomorrow', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:1d`, '1d');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:1d due:' + dateTomorrowString);
  });

  test('Should add a new todo with due date set to next week', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:w`, 'w');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:w due:' + dateInOneWeek);
  });  

  test('Should add a new todo with due date set to today in 2 months', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:2m`, '2m');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:2m due:' + dateTodayInTwoMonths);
  });  

  test('Should add a new todo with due date set to day after tomorrow', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:+1d due:${dateTomorrowString}`, '+1d');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:+1d due:' + dateDayAfterTomorrowString);
  });

  test('Should add a new todo with due date set to today in 7 weeks', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:7w due:${dateTomorrowString}`, '7w');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:7w due:' + dateTodayInSevenWeeks);
  });  

  test('Should add a new todo with due date set to next possible business day', async () => {
    const recurringTodo = await createRecurringTodo(`x 2023-07-21 2023-07-21 Line 1 rec:+1b`, '+1b');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual('2023-07-21 Line 1 rec:+1b due:2023-07-24');
  });
  
});