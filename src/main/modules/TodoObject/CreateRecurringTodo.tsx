import { Item } from 'jstodotxt';
import dayjs from 'dayjs';
import { writeTodoObjectToFile } from '../File/Write';
import { configStorage } from '../../config';

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
    const appendCreationDate = configStorage.get('appendCreationDate');

    if(!appendCreationDate) {
      recurringTodoObject.setCreated(null);
    }

    const previousPriorityIndex = recurringTodoObject.extensions().findIndex((extension) => extension.key === 'pri');
    const previousPriorityString = recurringTodoObject.extensions()[previousPriorityIndex]?.value;
    if(previousPriorityString && previousPriorityString !== 'null') {
      recurringTodoObject.setPriority(previousPriorityString)
    }

    if (recurrence && completedDate) {
      const strictRecurrence: boolean = recurrence.startsWith('+');
      const recurrenceInterval: any = strictRecurrence ? recurrence.slice(1) : recurrence;
      const oldDueDate: any = recurringTodoObject?.extensions()?.find((item) => item.key === 'due')?.value;
      const oldThresholdDate: any = recurringTodoObject?.extensions()?.find((item) => item.key === 't')?.value;
      const daysBetween = dayjs(oldDueDate, 'YYYY-MM-DD').diff(oldThresholdDate, 'day');
      const newDueDate = strictRecurrence
        ? addRecurrenceToDate(dayjs(oldDueDate).toDate(), recurrenceInterval)
        : addRecurrenceToDate(dayjs(completedDate).toDate(), recurrenceInterval);
      const newThresholdDate = strictRecurrence
        ? addRecurrenceToDate(dayjs(oldThresholdDate).toDate(), recurrenceInterval)
        : dayjs(newDueDate).subtract(daysBetween, 'day').toDate();
      if(completedDate) recurringTodoObject.setExtension('due', dayjs(newDueDate).format('YYYY-MM-DD'));
      if(oldThresholdDate) recurringTodoObject.setExtension('t', dayjs(newThresholdDate).format('YYYY-MM-DD'));
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