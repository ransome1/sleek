"use strict";
import { userData } from "../render.js";
import { items } from "./todos.mjs";
import { convertDate } from "./date.mjs";

function splitRecurrence(recurrence) {
  let mul = 1;
  let period = recurrence;
  let plus = false;
  if(recurrence !== undefined && recurrence.length > 1) {
    if (recurrence.substr(0,1) == "+") {
      plus = true;
      if (recurrence.length > 2)
        mul = Number(recurrence.substr(1, recurrence.length - 2));
    } else {
      mul = Number(recurrence.substr(0, recurrence.length - 1));
    }
    if (mul == 0) {
      mul = 1;
    }
    period = recurrence.substr(-1);
  }
  return {
    mul: mul,
    period: period,
    plus: plus,
    toString: function() {
      return this.mul == 1 || this.period === undefined ?
        this.period : (this.plus ? "+" : "") + this.mul + this.period;
    }
  };
}
function generateRecurrence(todo) {
  try {
    // duplicate not reference
    let recurringTodo = Object.assign({}, todo);
    recurringTodo.date = new Date;

    // if the item to be duplicated has been completed before the due date, the recurring item needs to be set incomplete again
    recurringTodo.complete = false;
    recurringTodo.completed = null;

    // adjust due and threshold dates 
    let recSplit = splitRecurrence(todo.rec);
    if (recSplit.plus) {
      // strict recurrence is based on previous date value
      if (todo.t)
        recurringTodo.t = addIntervalToDate(todo.t, recSplit.mul, recSplit.period);
      if (todo.due)
        recurringTodo.due = addIntervalToDate(todo.due, recSplit.mul, recSplit.period);
    } else {
      // non-strict recurrence is based on today's date
      if (todo.t) {
        let threshold_base = new Date();
        if (todo.due) {
          // preserve interval between threshold and due date
          let interval = todo.due - todo.t;  // millisec
          threshold_base = new Date(threshold_base.getTime() - interval);
        }
        recurringTodo.t = addIntervalToDate(threshold_base, recSplit.mul, recSplit.period);
        console.log("t based on today plus rec: " + recurringTodo + " todo.t is " + recurringTodo.t);
      }
      if (todo.due)
        recurringTodo.due = addIntervalToDate(new Date(), recSplit.mul, recSplit.period);
    }
    if (!todo.t && !todo.due) {
      // This is an ambiguous case: there is a rec: tag but no dates to apply it to.
      // Some would prefer to make this a no-op, but past versions of sleek have added
      // a due date when there is only a recurrence, so we will continue to do that here.
      recurringTodo.due = addIntervalToDate(new Date(), recSplit.mul, recSplit.period);
    }
    // the following strings are magic from jsTodoTxt and must be changed when dates are changed
    // because TodoTxtItem.toString() relies on the fieldString values, not the field values themselves.
    if (recurringTodo.t)
      recurringTodo.tString = convertDate(recurringTodo.t);
    if (recurringTodo.due)
      recurringTodo.dueString = convertDate(recurringTodo.due);

    // get index of recurring todo
    const index = items.objects.map(function(item) {return item.toString().replaceAll(String.fromCharCode(16)," "); }).indexOf(recurringTodo.toString().replaceAll(String.fromCharCode(16)," "));
    // only add recurring todo if it is not already in the list
    if(index===-1) {
      items.objects.push(recurringTodo);
      //tableContainerDue.appendChild(generateTableRow(recurringTodo));
      window.api.send("writeToFile", [items.objects.join("\n").toString() + "\n", userData.file]);
      return Promise.resolve("Success: Recurring todo created and written into file: " + recurringTodo);
    } else {
      return Promise.resolve("Info: Recurring todo already in file, won't write anything");
    }
  } catch(error) {
    error.functionName = generateRecurrence.name;
    return Promise.reject(error);
  }
}

// addIntervalToDate used to compute recurrences, but now also used to add
// or subtract a time interval to/from dates in filter query language.
// Therefore it must now handle negative count values.
function addIntervalToDate(due, count, unit) {
  let days = 0;
  let months = 0;
  switch (unit) {
    case "b":
      // add "mul" business days, defined as not Sat or Sun
      {
        let incr = (count >= 0)? 1: -1;
        let bdays_left = count * incr;
        let millisec_due = due.getTime();
        let day_of_week = due.getDay(); // 0=Sunday, 1..5 weekday, 6=Saturday
        while (bdays_left > 0) {
          millisec_due += 1000 * 60 * 60 * 24 * incr;  // add a day to time
          if (incr > 0) {
            day_of_week = (day_of_week < 6 ? day_of_week + incr : 0);
          } else {
            day_of_week = (day_of_week > 0 ? day_of_week + incr : 6);
          }
          if (day_of_week > 0 && day_of_week < 6) {
            bdays_left--;  // one business day step accounted for!
          }
        }
        return new Date(millisec_due);
      }
    case "d":
      days = 1;
      break;
    case "w":
      days = 7;
      break;
    case "m":
      months = 1;
      break;
    case "y":
      months = 12;
      break;
  }
  if (months > 0) {
    let due_month = due.getMonth() + count * months;
    let due_year = due.getFullYear() + Math.floor(due_month/12);
    due_month = due_month % 12;
    let monthlen = new Date(due_year, due_month+1, 0).getDate();
    let due_day = Math.min(due.getDate(), monthlen);
    return new Date(due_year, due_month, due_day);
  }
  due = due.getTime();
  due += 1000 * 60 * 60 * 24 * count * days;
  return new Date(due);
}

export { splitRecurrence, generateRecurrence, addIntervalToDate };
