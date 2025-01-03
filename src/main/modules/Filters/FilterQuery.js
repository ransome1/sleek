// This is a simple stack machine that executes a filter language query
// compiled by filterlang.pegjs (which generates filterlang.ts).
// The compiled query consists of a list of postfix opcodes designed
// specifically for todo.txt searching and filtering.

import dayjs from 'dayjs';

function runQuery(todoObject, compiledQuery) {
  if(!compiledQuery) {
    return true;  // a null query matches everything
  }
  let stack = [];
  let operand1 = false;
  let operand2 = false;
  let next = 0;
  let q = compiledQuery.slice(); // shallow copy
  while (q.length > 0) {
    const opcode = q.shift();
    switch(opcode) {
      case "pri":
        stack.push(todoObject.priority);
        break;
      case "due":
        if(todoObject.due) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = dayjs(todoObject.due).toDate();
          stack.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
        } else {
          stack.push(undefined);  // all comparisons will return false
        }
        break;
      case "duestr":
        // match next value (a string) as prefix of ISO date string of due date
        next = q.shift(); // the string to compare
        if(todoObject.dueString) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = dayjs(todoObject.dueString).toDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false);  // no due date
        }
        break;
      case "threshold":
        if(todoObject.t) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = dayjs(todoObject.t).toDate();
          stack.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
        } else {
          stack.push(undefined);  // all comparisons will return false
        }
        break;
      case "tstr":
        // match next value (a string) as prefix of ISO date string of threshold date
        next = q.shift(); // the string to compare
        if(todoObject.tString) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = dayjs(todoObject.tString).toDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false);  // no threshold date
        }
        break;
      case "complete":
        stack.push(todoObject.complete);
        break;
      case "string":
        next = q.shift();  // the string value to match
        stack.push(todoObject.toString().toLowerCase().indexOf(next.toLowerCase()) !== -1);
        break;
      case "regex":
        next = q.shift();  // the regex to match
        stack.push(next.test(todoObject.toString()));
        break;
      case "==":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 === operand2);
        break;
      case "!=":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 !== operand2);
        break;
      case "<":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 < operand2);
        break;
      case "<=":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 <= operand2);
        break;
      case ">":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 > operand2);
        break;
      case ">=":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 >= operand2);
        break;
      case "++":
        next = q.shift();
        if(next === "*") {
          stack.push(todoObject.projects.length > 0);
        } else if(next.startsWith('"')) {
          stack.push(todoObject.projects && todoObject.projects.includes(next.slice(1,-1)));
        } else {
          // case-insensitive match for next as a substring of the project name
          let pattern = next.toLowerCase();
          stack.push(todoObject.projects && todoObject.projects.findIndex(function(p) {
            return p.toLowerCase().indexOf(pattern) > -1;
          }) > -1);
        }
        break;
      case "@@":
        next = q.shift();
        if(next === "*") {
          stack.push(todoObject.contexts.length > 0);
        } else if(next.startsWith('"')) {
          stack.push(todoObject.contexts && todoObject.contexts.includes(next.slice(1,-1)));
        } else {
          // case-insensitive match for next as a substring of the context name
          let pattern = next.toLowerCase();
          stack.push(todoObject.contexts && todoObject.contexts.findIndex(function(c) {
            return c.toLowerCase().indexOf(pattern) > -1;
          }) > -1);
        }
        break;
      case "||":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 || operand2);
        break;
      case "&&":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 && operand2);
        break;
      case "!!":
        operand1 = stack.pop();
        stack.push(!operand1);
        break;
      default:
        // should be a data todoObject like a string or date in millisec, ...
        stack.push(opcode);
        break;
    }
  }
  return stack.pop();
}

export { runQuery };