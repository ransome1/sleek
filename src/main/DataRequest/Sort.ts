import { TodoObject } from "@sleek-types";
import { Sorting } from "../../@types/Settings";
import { RecurrenceInterval, intervalDayWeight } from "./RecurrenceInterval";

// Looks up the weight for a recurrence interval, returning undefined if invalid.
// This collapses validation and lookup into a single safe operation.
function getIntervalWeight(interval: string): number | undefined {
  return intervalDayWeight[interval as RecurrenceInterval];
}

// Parses a recurrence value into a sortable numeric key.
// Input: the raw rec: extension value (e.g., "1w", "3m", "+1d", "w").
// Note: The "rec:" key prefix has already been stripped by CreateTodoObjects.
//
// Output: A numeric key where:
//   - (count × intervalWeight) maps recurrence to days-equivalent
//   - strictnessTieBreaker (0 for relative, 0.001 for strict) sorts relative before strict
//   - Infinity for null/invalid, ensuring they sort last
//
// Examples:
//   "1d" → 1.000 (daily, most frequent)
//   "1w" → 7.000 (weekly)
//   "+1w" → 7.001 (strict weekly, after relative)
//   "1m" → 30.000 (monthly)
//   "1y" → 365.000 (yearly, least frequent)
//   null → Infinity (sorts last)
//   "1x" → Infinity (invalid interval)
function parseRecurrenceSortKey(rec: string | null): number {
  if (!rec) return Infinity;

  // Check for strict prefix (+)
  const strictRecurrence = rec.startsWith("+");
  const normalized = strictRecurrence ? rec.slice(1) : rec;

  // Extract interval (last char) and count (everything before)
  const interval = normalized.slice(-1);
  const countStr = normalized.slice(0, -1);
  const count = countStr === "" ? 1 : parseInt(countStr, 10);

  // Validate count
  if (isNaN(count) || count <= 0) return Infinity;

  // Look up interval weight; invalid intervals return undefined → Infinity
  const weight = getIntervalWeight(interval);
  if (weight === undefined) return Infinity;

  // Calculate sort key: (count × interval weight) with strictness as tie-breaker
  // Relative recurrence (no +) sorts before strict (+)
  const strictnessTieBreaker = strictRecurrence ? 0.001 : 0;
  return count * weight + strictnessTieBreaker;
}

const compareValues = (
  a: string | string[] | number | boolean | null,
  b: string | string[] | number | boolean | null,
  invert: boolean,
): number => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  const numA = typeof a === "string" && !isNaN(Number(a)) ? Number(a) : a;
  const numB = typeof b === "string" && !isNaN(Number(b)) ? Number(b) : b;

  if (typeof numA === "number" && typeof numB === "number") {
    return invert ? numB - numA : numA - numB;
  }

  const strA = String(a);
  const strB = String(b);

  return invert ? strB.localeCompare(strA) : strA.localeCompare(strB);
};

const sortTodoObjects = (
  a: TodoObject,
  b: TodoObject,
  sorting: Sorting[],
): number => {
  for (const { value, invert } of sorting) {
    let compareResult: number;

    // Special handling for recurrence sorting by semantic duration
    if (value === "rec") {
      const keyA = parseRecurrenceSortKey(a.rec);
      const keyB = parseRecurrenceSortKey(b.rec);

      // Nulls always sort last, regardless of invert direction (consistent with compareValues)
      if (keyA === Infinity && keyB === Infinity) {
        compareResult = 0;
      } else if (keyA === Infinity) {
        compareResult = 1; // a is null/invalid → sorts last
      } else if (keyB === Infinity) {
        compareResult = -1; // b is null/invalid → sorts last
      } else {
        compareResult = invert ? keyB - keyA : keyA - keyB;
      }
    } else {
      compareResult = compareValues(a[value], b[value], invert);
    }

    if (compareResult !== 0) {
      return compareResult;
    }
  }
  return 0;
};

export { sortTodoObjects, parseRecurrenceSortKey };
