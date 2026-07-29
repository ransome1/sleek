// Pure constants file for recurrence interval definitions.
// Enables shared use between CreateRecurringTodo.ts and Sort.ts without coupling.

export enum RecurrenceInterval {
  Daily = "d",
  BusinessDays = "b",
  Weekly = "w",
  Monthly = "m",
  Annually = "y",
}

// Semantic duration mapping: how many "days" each interval represents.
// Used to sort recurrences by frequency: smaller = more frequent.
export const intervalDayWeight: Record<RecurrenceInterval, number> = {
  [RecurrenceInterval.Daily]: 1,
  [RecurrenceInterval.BusinessDays]: 1,
  [RecurrenceInterval.Weekly]: 7,
  [RecurrenceInterval.Monthly]: 30,
  [RecurrenceInterval.Annually]: 365,
};
