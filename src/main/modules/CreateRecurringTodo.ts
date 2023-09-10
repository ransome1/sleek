import { writeTodoObjectToFile } from './WriteToFile';
import { Item } from 'jstodotxt';
import dayjs from 'dayjs';

enum RecurrenceInterval {
  Daily = 'd',
  BusinessDays = 'b',
  Weekly = 'w',
  Monthly = 'm',
  Annually = 'y',
}

const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let remainingDays = days;
  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      remainingDays--;
    }
  }
  return result;
};

const addRecurrenceToDate = (date: Date, recurrence: string): Date => {
  const interval = recurrence.slice(-1) as RecurrenceInterval;
  const recurrenceValue = parseInt(recurrence.slice(0, -1)) || 1;
  switch (interval) {
    case RecurrenceInterval.Daily:
      return dayjs(date).add(recurrenceValue, 'day').toDate();
    case RecurrenceInterval.BusinessDays:
      return addBusinessDays(date, recurrenceValue);
    case RecurrenceInterval.Weekly:
      return dayjs(date).add(recurrenceValue, 'week').toDate();
    case RecurrenceInterval.Monthly:
      return dayjs(date).add(recurrenceValue, 'month').toDate();
    case RecurrenceInterval.Annually:
      return dayjs(date).add(recurrenceValue, 'year').toDate();
    default:
      return date;
  }
};

const createRecurringTodo = async (string: string, recurrence: string): Promise<string> => {
  try {
    const recurringTodoObject = new Item(string);
    const completedDate = recurringTodoObject.completed();
    if (recurrence && completedDate) {
      const strictRecurrence = recurrence.startsWith('+');
      const recurrenceInterval = strictRecurrence ? recurrence.slice(1) : recurrence;
      const oldDueDate = recurringTodoObject?.extensions()?.find((item) => item.key === 'due');
      const targetDate = strictRecurrence && oldDueDate?.value
        ? addRecurrenceToDate(dayjs(oldDueDate.value, 'YYYY-MM-DD').toDate(), recurrenceInterval)
        : addRecurrenceToDate(completedDate, recurrenceInterval);
      recurringTodoObject.setExtension('due', dayjs(targetDate).format('YYYY-MM-DD'));
      recurringTodoObject.setComplete(false);
      recurringTodoObject.setCompleted(null);
      await writeTodoObjectToFile(-1, recurringTodoObject.toString(), false);
      return 'Recurring todo created';
    }
    return 'No recurring todo created';
  } catch (error) {
    return Promise.reject(error);
  }
};

export { createRecurringTodo, addRecurrenceToDate };