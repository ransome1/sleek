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
    const JsTodoTxtObject = new Item(string);
    const completedDate = JsTodoTxtObject.completed();
    const appendCreationDate = configStorage.get('appendCreationDate');

    if(!appendCreationDate) {
      JsTodoTxtObject.setCreated(null);
    }

    if (recurrence && completedDate) {
      console.log(recurrence);
      const strictRecurrence: boolean = recurrence.startsWith('+');
      console.log(strictRecurrence);
      const recurrenceInterval: any = strictRecurrence ? recurrence.slice(1) : recurrence;
      const oldDueDate: any = JsTodoTxtObject?.extensions()?.find((item) => item.key === 'due')?.value;
      const oldThresholdDate: any = JsTodoTxtObject?.extensions()?.find((item) => item.key === 't')?.value;
      const daysBetween = dayjs(oldDueDate, 'YYYY-MM-DD').diff(oldThresholdDate, 'day');
      const newDueDate = strictRecurrence
        ? addRecurrenceToDate(dayjs(oldDueDate).toDate(), recurrenceInterval)
        : addRecurrenceToDate(dayjs(completedDate).toDate(), recurrenceInterval);
      console.log(addRecurrenceToDate(dayjs(oldThresholdDate).toDate(), recurrenceInterval));
      const newThresholdDate = strictRecurrence
        ? addRecurrenceToDate(dayjs(oldThresholdDate).toDate(), recurrenceInterval)
        : addRecurrenceToDate(dayjs(completedDate).toDate(), recurrenceInterval);

      // If the user only uses threshold date and no due date, the recurrence should not create a due date:
      const recurrenceOnlyForThresholdDate = oldThresholdDate && !oldDueDate;
      if(completedDate && !recurrenceOnlyForThresholdDate) JsTodoTxtObject.setExtension('due', dayjs(newDueDate).format('YYYY-MM-DD'));
      if(oldThresholdDate) JsTodoTxtObject.setExtension('t', dayjs(newThresholdDate).format('YYYY-MM-DD'));
      JsTodoTxtObject.setComplete(false);
      JsTodoTxtObject.setCompleted(null);

      await writeTodoObjectToFile(-1, JsTodoTxtObject.toString());
      return 'Recurring todo created';
    }
    return 'No recurring todo created';
  } catch (error: any) {
    return Promise.reject(error);
  }
};

export { createRecurringTodo, addRecurrenceToDate };