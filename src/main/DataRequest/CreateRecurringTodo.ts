import { Item } from "jstodotxt";
import { DateTime } from "luxon";
import { prepareContentForWriting } from "../File/Write";
import { lineBreakPlaceholder } from "../Shared";

enum RecurrenceInterval {
  Daily = "d",
  BusinessDays = "b",
  Weekly = "w",
  Monthly = "m",
  Annually = "y",
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

const addRecurrenceToDate = (
  date: Date,
  recurrenceInterval: string,
  recurrenceValue: number,
): Date | null => {
  const validRecurrenceValue =
    isNaN(recurrenceValue) || recurrenceValue === undefined
      ? 1
      : recurrenceValue;
  switch (recurrenceInterval) {
    case RecurrenceInterval.Daily:
      return DateTime.fromJSDate(date)
        .plus({ days: validRecurrenceValue })
        .toJSDate();
    case RecurrenceInterval.BusinessDays:
      return addBusinessDays(date, validRecurrenceValue);
    case RecurrenceInterval.Weekly:
      return DateTime.fromJSDate(date)
        .plus({ weeks: validRecurrenceValue })
        .toJSDate();
    case RecurrenceInterval.Monthly:
      return DateTime.fromJSDate(date)
        .plus({ months: validRecurrenceValue })
        .toJSDate();
    case RecurrenceInterval.Annually:
      return DateTime.fromJSDate(date)
        .plus({ years: validRecurrenceValue })
        .toJSDate();
    default:
      return date;
  }
};

const createRecurringTodo = (string: string, recurrence: string): string => {
  const updatedString = (string || "").replaceAll(
    // eslint-disable-next-line no-control-regex
    /[\x10\r\n]/g,
    ` ${lineBreakPlaceholder} `,
  );

  // todo: use createTodoObject instead
  const JsTodoTxtObject = new Item(updatedString);
  const creationDate = new Date();

  JsTodoTxtObject.setCreated(creationDate);

  if (recurrence) {
    const strictRecurrence: boolean = recurrence.startsWith("+");

    const updatedRecurrence: any = strictRecurrence
      ? recurrence.slice(1)
      : recurrence;
    const recurrenceInterval = updatedRecurrence.slice(
      -1,
    ) as RecurrenceInterval;
    const recurrenceValue = parseInt(updatedRecurrence.slice(0, -1));

    const oldDueDate: any = JsTodoTxtObject?.extensions()?.find(
      (item) => item.key === "due",
    )?.value;
    const oldThresholdDate: any = JsTodoTxtObject?.extensions()?.find(
      (item) => item.key === "t",
    )?.value;
    const daysBetween: number =
      oldDueDate && oldThresholdDate
        ? DateTime.fromISO(oldDueDate).diff(
            DateTime.fromISO(oldThresholdDate),
            "days",
          ).days
        : 0;

    const newDueDate =
      oldDueDate === undefined && recurrenceValue === 0
        ? null
        : strictRecurrence
          ? addRecurrenceToDate(
              DateTime.fromISO(oldDueDate).toJSDate(),
              recurrenceInterval,
              recurrenceValue,
            )
          : addRecurrenceToDate(
              DateTime.fromJSDate(creationDate).toJSDate(),
              recurrenceInterval,
              recurrenceValue,
            );

    const newThresholdDate = strictRecurrence
      ? addRecurrenceToDate(
          DateTime.fromISO(oldThresholdDate).toJSDate(),
          recurrenceInterval,
          recurrenceValue,
        )
      : daysBetween > 0
        ? DateTime.fromJSDate(newDueDate!)
            .minus({ days: daysBetween })
            .toJSDate()
        : addRecurrenceToDate(
            DateTime.fromJSDate(creationDate).toJSDate(),
            recurrenceInterval,
            recurrenceValue,
          );

    const recurrenceOnlyForThresholdDate = oldThresholdDate && !oldDueDate;

    if (newDueDate && creationDate && !recurrenceOnlyForThresholdDate)
      JsTodoTxtObject.setExtension(
        "due",
        DateTime.fromJSDate(newDueDate).toFormat("yyyy-MM-dd"),
      );
    if (oldThresholdDate)
      JsTodoTxtObject.setExtension(
        "t",
        DateTime.fromJSDate(newThresholdDate!).toFormat("yyyy-MM-dd"),
      );

    JsTodoTxtObject.setComplete(false);
    JsTodoTxtObject.setCompleted(null);

    prepareContentForWriting(-1, JsTodoTxtObject.toString());

    return "Recurring todo created";
  }
  return "No recurring todo created";
};

export { createRecurringTodo, addRecurrenceToDate };
