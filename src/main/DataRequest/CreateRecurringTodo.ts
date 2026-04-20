import { Item } from "jstodotxt";
import { DateTime } from "luxon";
import { writeSingleTodoToFile } from "../File/Write";
import { lineBreakPlaceholder } from "../Shared";
import { SettingsStore } from "../Stores";

enum RecurrenceInterval {
  Daily = "d",
  BusinessDays = "b",
  Weekly = "w",
  Monthly = "m",
  Annually = "y",
}

const addBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let remainingDays = days;
  while (remainingDays > 0) {
    result = new Date(result.setDate(result.getDate() + 1));
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      remainingDays--;
    }
  }
  return result;
};

const addRecurrenceToDate = (
  date: Date,
  interval: string,
  value: number,
): Date => {
  const safeValue = isNaN(value) || value === 0 ? 1 : value;
  switch (interval as RecurrenceInterval) {
    case RecurrenceInterval.Daily:
      return DateTime.fromJSDate(date).plus({ days: safeValue }).toJSDate();
    case RecurrenceInterval.BusinessDays:
      return addBusinessDays(date, safeValue);
    case RecurrenceInterval.Weekly:
      return DateTime.fromJSDate(date).plus({ weeks: safeValue }).toJSDate();
    case RecurrenceInterval.Monthly:
      return DateTime.fromJSDate(date).plus({ months: safeValue }).toJSDate();
    case RecurrenceInterval.Annually:
      return DateTime.fromJSDate(date).plus({ years: safeValue }).toJSDate();
    default:
      return date;
  }
};

const createRecurringTodo = (string: string, recurrence: string): void => {
  const updatedString = (string || "").replaceAll(
    // eslint-disable-next-line no-control-regex
    /[\x10\r\n]/g,
    ` ${lineBreakPlaceholder} `,
  );

  // todo: use createTodoObject instead
  const JsTodoTxtObject = new Item(updatedString);
  const creationDate = new Date();
  const appendCreationDate: boolean =
    SettingsStore.get("appendCreationDate") || false;

  if (appendCreationDate) {
    JsTodoTxtObject.setCreated(creationDate);
  }

  if (!recurrence) return;

  const strictRecurrence: boolean = recurrence.startsWith("+");
  const normalizedRecurrence: string = strictRecurrence
    ? recurrence.slice(1)
    : recurrence;
  const recurrenceInterval: string = normalizedRecurrence.slice(-1);
  // A bare interval string like "w" has no numeric prefix; treat it as 1.
  const parsedValue = parseInt(normalizedRecurrence.slice(0, -1));
  const recurrenceValue: number = isNaN(parsedValue) ? 1 : parsedValue;

  const oldDueDate: string | undefined = JsTodoTxtObject?.extensions()?.find(
    (item) => item.key === "due",
  )?.value;
  const oldThresholdDate: string | undefined =
    JsTodoTxtObject?.extensions()?.find((item) => item.key === "t")?.value;

  const daysBetween: number =
    oldDueDate && oldThresholdDate
      ? DateTime.fromISO(oldDueDate).diff(
          DateTime.fromISO(oldThresholdDate),
          "days",
        ).days
      : 0;

  // For strict recurrence, use the previous due date as the base; fall back to
  // creationDate when there is no existing due date (docs: "the new duplicate
  // todo will have a due date equal to the completion date plus the recurrence
  // interval").
  const baseDate =
    strictRecurrence && oldDueDate
      ? DateTime.fromISO(oldDueDate).toJSDate()
      : creationDate;

  const newDueDate: Date = addRecurrenceToDate(
    baseDate,
    recurrenceInterval,
    recurrenceValue,
  );

  const thresholdBase =
    strictRecurrence && oldThresholdDate
      ? DateTime.fromISO(oldThresholdDate).toJSDate()
      : daysBetween > 0
        ? DateTime.fromJSDate(newDueDate!)
            .minus({ days: daysBetween })
            .toJSDate()
        : creationDate;

  const newThresholdDate: Date = addRecurrenceToDate(
    thresholdBase,
    recurrenceInterval,
    recurrenceValue,
  );

  const recurrenceOnlyForThresholdDate = oldThresholdDate && !oldDueDate;

  if (!recurrenceOnlyForThresholdDate) {
    JsTodoTxtObject.setExtension(
      "due",
      DateTime.fromJSDate(newDueDate).toFormat("yyyy-MM-dd"),
    );
  }

  if (oldThresholdDate) {
    JsTodoTxtObject.setExtension(
      "t",
      DateTime.fromJSDate(newThresholdDate).toFormat("yyyy-MM-dd"),
    );
  }

  JsTodoTxtObject.setComplete(false);
  JsTodoTxtObject.setCompleted(null);

  writeSingleTodoToFile(-1, JsTodoTxtObject.toString(), false);
};

export { createRecurringTodo, addRecurrenceToDate };
