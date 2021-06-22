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
    recurringTodo.complete = false;
    recurringTodo.completed = null;
    // if the item to be duplicated has been completed before the due date, the recurring item needs to be set incomplete again
    recurringTodo.date = new Date;
    // if todo has no due date, the recurrence time frame will be added to the date of completion
    recurringTodo.due = getDueDate(todo.due, todo.rec);
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
function getDueDate(due, recurrence) {
  let recSplit = splitRecurrence(recurrence);
  if (!recSplit.plus || !due) {
    // no plus in recurrence expression, so do the default "non-strict" recurrence.
    // (Otherwise we will use the previous due date, for strict recurrence.)
    due = new Date();  // use today's date as base for recurrence
  }
  return addIntervalToDate(due, recSplit.mul, recSplit.period);
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
        let incr = 1;
        let bdays_left = count;
        if (count < 0) {
          incr = -1;
          bdays_left = -count;
        }
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
