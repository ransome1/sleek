import fs from 'fs/promises';
import { writeTodoObjectToFile } from '../../main/modules/File/Write';
import { createRecurringTodo } from '../../main/modules/TodoObject/CreateRecurringTodo';
import { getActiveFile } from '../../main/modules/File/Active';
import { lines } from '../../main/modules/TodoObject/CreateTodoObjects';
import dayjs from 'dayjs';

jest.mock('../../main/modules/TodoObject/CreateTodoObjects', () => ({
  lines: [''],
}));

jest.mock('../../main/config', () => ({
  configStorage: {
    get: jest.fn().mockReturnValue([
      {
        active: true,
        todoFileName: 'recurrence.txt',
        todoFilePath: './src/__tests__/__mock__/recurrence.txt',
        doneFilePath: './src/__tests__/__mock__/done.txt',
      },
    ]),
  },
}));  

const dateToday = dayjs(new Date());
const dateTodayString = dayjs(dateToday).format('YYYY-MM-DD');
const dateTomorrowString = dateToday.add(1, 'day').format('YYYY-MM-DD');
const dateDayAfterTomorrowString = dateToday.add(2, 'day').format('YYYY-MM-DD');
const dateInOneWeek = dateToday.add(7, 'day');
const dateInOneWeekString = dateInOneWeek.format('YYYY-MM-DD');
const dateInOneWeekMinus10String = dateInOneWeek.subtract(10, 'day').format('YYYY-MM-DD');
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
    expect(fileContent.split('\n').pop()).toEqual(dateTodayString + ' Line 1 rec:w due:' + dateInOneWeekString);
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

  test('Should add a new todo with due date set to next possible business day, based off a todo which already contains a due date', async () => {
    const recurringTodo = await createRecurringTodo(`x 2023-07-21 2023-07-21 Line 1 due:2023-07-21 rec:+1b`, '+1b');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual('2023-07-21 Line 1 due:2023-07-24 rec:+1b');
  });

  test('Should add a new todo adding a strict recurrence of one year to due date and threshold date', async () => {
    const recurringTodo = await createRecurringTodo(`x 2021-01-01 2021-01-01 taxes are due in one year t:2021-03-30 due:2021-04-30 rec:+1y`, '+1y');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual('2021-01-01 taxes are due in one year t:2022-03-30 due:2022-04-30 rec:+1y');
  });

  test('Should add a new todo adding a non-strict recurrence of one week to due date and threshold date', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Water plants @home +quick due:2021-07-19 t:2021-07-09 rec:1w`, '1w');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(`${dateTodayString} Water plants @home +quick due:${dateInOneWeekString} t:${dateInOneWeekMinus10String} rec:1w`);
  });

  test('Should add a new todo adding a strict recurrence of one day to threshold date. No due date should be created.', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:+1d t:2023-09-19`, '1+d');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(`${dateTodayString} Line 1 rec:+1d t:2023-09-20`);
  });  

  test('Should add a new todo and preserve the priority in the pri extension, but should not set the priority (A) for the task.', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} Line 1 rec:1d pri:A`, '1d');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(`${dateTodayString} Line 1 rec:1d pri:A due:${dateTomorrowString}`);
  });

  test('Should add a new todo based on a daily recurrence and a threshold date set for today, without unwanted due date and priority labels', async () => {
    const recurringTodo = await createRecurringTodo(`x ${dateTodayString} ${dateTodayString} (A) Do something rec:d t:${dateTodayString} @SomeContext`, 'd');
    const fileContent = await fs.readFile('./src/__tests__/__mock__/recurrence.txt', 'utf8');
    expect(fileContent.split('\n').pop()).toEqual(`${dateTodayString} (A) Do something rec:d t:${dateTomorrowString} @SomeContext`);
  });

});