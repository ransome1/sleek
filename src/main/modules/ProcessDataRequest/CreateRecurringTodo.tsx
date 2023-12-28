import { Item } from 'jstodotxt';
import dayjs from 'dayjs';
import { writeTodoObjectToFile } from '../File/Write';

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
    if(result.getDay() !== 0 && result.getDay() !== 6) {
      remainingDays--;
    }
  }
  return result;
};

const addRecurrenceToDate = (date: Date, recurrenceInterval: string, recurrenceValue: number): Date | null => {
  const validRecurrenceValue = isNaN(recurrenceValue) || recurrenceValue === undefined ? 1 : recurrenceValue;
  switch (recurrenceInterval) {
    case RecurrenceInterval.Daily:
      return dayjs(date).add(validRecurrenceValue, 'day').toDate();
    case RecurrenceInterval.BusinessDays:
      return addBusinessDays(date, validRecurrenceValue);
    case RecurrenceInterval.Weekly:
      return dayjs(date).add(validRecurrenceValue, 'week').toDate();
    case RecurrenceInterval.Monthly:
      return dayjs(date).add(validRecurrenceValue, 'month').toDate();
    case RecurrenceInterval.Annually:
      return dayjs(date).add(validRecurrenceValue, 'year').toDate();
    default:
      return date;
  }
};

const createRecurringTodo = async (string: string, recurrence: string): Promise<string> => {

  let updatedString = (string || '').replaceAll(/[\x10\r\n]/g, ` ${String.fromCharCode(16)} `);
  
  const JsTodoTxtObject = new Item(updatedString);
  const creationDate = new Date();

  JsTodoTxtObject.setCreated(creationDate);

  if(recurrence) {
    const strictRecurrence: boolean = recurrence.startsWith('+');
    
    const updatedRecurrence: any = strictRecurrence ? recurrence.slice(1) : recurrence;
    const recurrenceInterval = updatedRecurrence.slice(-1) as RecurrenceInterval;
    const recurrenceValue = parseInt(updatedRecurrence.slice(0, -1));
    
    const oldDueDate: any = JsTodoTxtObject?.extensions()?.find((item) => item.key === 'due')?.value;
    const oldThresholdDate: any = JsTodoTxtObject?.extensions()?.find((item) => item.key === 't')?.value;
    const daysBetween: number = (oldDueDate && oldThresholdDate) ? dayjs(oldDueDate, 'YYYY-MM-DD').diff(oldThresholdDate, 'day') : 0

    const newDueDate =
      oldDueDate === undefined && recurrenceValue === 0
        ? null
        : strictRecurrence
        ? addRecurrenceToDate(dayjs(oldDueDate).toDate(), recurrenceInterval, recurrenceValue)
        : addRecurrenceToDate(dayjs(creationDate).toDate(), recurrenceInterval, recurrenceValue);

    const newThresholdDate = strictRecurrence
      ? addRecurrenceToDate(dayjs(oldThresholdDate).toDate(), recurrenceInterval, recurrenceValue)
      : daysBetween > 0
        ? dayjs(newDueDate).subtract(daysBetween, 'day').toDate()
        : addRecurrenceToDate(dayjs(creationDate).toDate(), recurrenceInterval, recurrenceValue);

    // If the user only uses threshold date and no due date, the recurrence should not create a due date:
    const recurrenceOnlyForThresholdDate = oldThresholdDate && !oldDueDate;

    if(newDueDate && creationDate && !recurrenceOnlyForThresholdDate) JsTodoTxtObject.setExtension('due', dayjs(newDueDate).format('YYYY-MM-DD'));
    if(oldThresholdDate) JsTodoTxtObject.setExtension('t', dayjs(newThresholdDate).format('YYYY-MM-DD'));

    JsTodoTxtObject.setComplete(false);
    JsTodoTxtObject.setCompleted(null);

    await writeTodoObjectToFile(-1, JsTodoTxtObject.toString());

    return 'Recurring todo created';
  }
  return 'No recurring todo created';
};

export { createRecurringTodo, addRecurrenceToDate };
