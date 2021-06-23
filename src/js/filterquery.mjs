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
      case "priority":
        stack.push(item.priority);
        break;
      case "due":
        let d = item.due;
        if (d) {
          // normalize date to have time of midnight in local zone
          // we represent dates as millisec from epoch to simplify comparison
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }
        stack.push(d);
        break;
      case "complete":
        stack.push(item.complete);
        break;
      case "string":
        next = q.shift();  // the string value to match
        stack.push(item.toString().toLowerCase().indexOf(next.toLowerCase()) !== -1);
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
          // match the prefix of the project name
          stack.push(item.projects && item.projects.findIndex(function(p) {
            return p.startsWith(next);
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
          // match the prefix of the context name
          stack.push(item.contexts && item.contexts.findIndex(function(c) {
            return c.startsWith(next);
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
