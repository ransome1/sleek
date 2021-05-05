"use strict";
import { userData } from "../render.js";
import { items } from "./todos.mjs";
import { convertDate, isFuture } from "./date.mjs";

function splitRecurrence(recurrence) {
  let mul = 1;
  let period = recurrence;
  if(recurrence !== undefined && recurrence.length > 1) {
    mul = Number(recurrence.substr(0, recurrence.length - 1));
    period = recurrence.substr(-1);
  }
  return {
    mul: mul,
    period: period,
    toString: function() {
      return this.mul == 1 || this.period === undefined ?
        this.period : this.mul + this.period;
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
    if(recurringTodo.due && isFuture(recurringTodo.due)) {
      recurringTodo.date = new Date;
      recurringTodo.due = getRecurrenceDate(todo.due, todo.rec);
      recurringTodo.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
    } else if(!recurringTodo.due) {
      recurringTodo.date = new Date;
      recurringTodo.due = getRecurrenceDate(todo.completed, todo.rec);
      recurringTodo.dueString = convertDate(getRecurrenceDate(todo.completed, todo.rec));
    } else {
      recurringTodo.date = todo.due;
      recurringTodo.due = getRecurrenceDate(todo.due, todo.rec);
      recurringTodo.dueString = convertDate(getRecurrenceDate(todo.due, todo.rec));
    }
    // get index of recurring todo
    const index = items.objects.map(function(item) {return item.toString().replaceAll(String.fromCharCode(16)," "); }).indexOf(recurringTodo.toString().replaceAll(String.fromCharCode(16)," "));
    // only add recurring todo if it is not already in the list
    if(index===-1) {
      items.objects.push(recurringTodo);
      //tableContainerDue.appendChild(generateTableRow(recurringTodo));
      window.api.send("writeToFile", [items.objects.join("\n").toString(), userData.file]);
      return Promise.resolve("Success: Recurring todo created and written into file: " + recurringTodo);
    } else {
      return Promise.resolve("Info: Recurring todo already in file, won't write anything");
    }
  } catch(error) {
    error.functionName = generateRecurrence.name;
    return Promise.reject(error);
  }
}
function getRecurrenceDate(due, recurrence) {
  let recSplit = splitRecurrence(recurrence);
  let days = 0;
  switch (recSplit.period) {
    case "d":
      days = 1;
      break;
    case "w":
      days = 7;
      break;
    case "m":
      days = 30;
      break;
    case "y":
      days = 365;
      break;
  }
  due = due.getTime();
  due += 1000 * 60 * 60 * 24 * recSplit.mul * days;
  return new Date(due);
}

export { splitRecurrence, generateRecurrence };
