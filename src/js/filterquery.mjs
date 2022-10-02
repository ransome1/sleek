"use strict";
// This is a simple stack machine that executes a filter language query
// compiled by filterlang.pegjs (which generates filterlang.mjs).
// The compiled query consists of a list of postfix opcodes designed
// specifically for todo.txt searching and filtering.

function runQuery(item, compiledQuery) {
  if (!compiledQuery) {
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
        stack.push(item.priority);
        break;
      case "due":
        if (item.due) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = item.due;
          stack.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
        } else {
          stack.push(undefined);  // all comparisons will return false
        }
        break;
      case "duestr":
        // match next value (a string) as prefix of ISO date string of due date
        next = q.shift(); // the string to compare
        if (item.due) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = item.due;
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false);  // no due date
        }
        break;
      case "threshold":
        if (item.t) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = item.t;
          stack.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime());
        } else {
          stack.push(undefined);  // all comparisons will return false
        }
        break;
      case "tstr":
        // match next value (a string) as prefix of ISO date string of threshold date
        next = q.shift(); // the string to compare
        if (item.t) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          let d = item.t;
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false);  // no threshold date
        }
        break;
      case "complete":
        stack.push(item.complete);
        break;
      case "string":
        next = q.shift();  // the string value to match

        if(!userData.caseSensitive) {
          next = next.toLowerCase();
          item.raw = item.raw.toLowerCase();
        }

        stack.push(item.raw.indexOf(next) !== -1);
        break;
      case "regex":
        next = q.shift();  // the regex to match
        stack.push(next.test(item.toString()));
        break;
      case "==":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 == operand2);
        break;
      case "!=":
        operand2 = stack.pop();
        operand1 = stack.pop();
        stack.push(operand1 != operand2);
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
        if (next == "*") {
          stack.push(item.projects ? true : false);
        } else if (next.startsWith('"')) {
          stack.push(item.projects && item.projects.includes(next.slice(1,-1)));
        } else {
          // case-insensitive match for next as a substring of the project name
          let pattern = next;
          stack.push(item.projects && item.projects.findIndex(function(p) {
            
            if(!userData.caseSensitive) {
              pattern = pattern.toLowerCase();
              p = p.toLowerCase();
            }

            return p.indexOf(pattern) > -1;
          }) > -1);
        }
        break;
      case "@@":
        next = q.shift();
        if (next == "*") {
          stack.push(item.contexts ? true : false);
        } else if (next.startsWith('"')) {
          stack.push(item.contexts && item.contexts.includes(next.slice(1,-1)));
        } else {
          // case-insensitive match for next as a substring of the context name
          let pattern = next;
          stack.push(item.contexts && item.contexts.findIndex(function(c) {
            if(!userData.caseSensitive) {
              pattern = pattern.toLowerCase();
              c = c.toLowerCase();
            }

            return c.indexOf(pattern) > -1;
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
        // should be a data item like a string or date in millisec, ...
        stack.push(opcode);
        break;
    }
  }
  return stack.pop();
}

export { runQuery };
