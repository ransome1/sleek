import dayjs from "dayjs";

type Opcode =
  | "pri"
  | "due"
  | "duestr"
  | "threshold"
  | "tstr"
  | "complete"
  | "string"
  | "regex"
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "++"
  | "@@"
  | "||"
  | "&&"
  | "!!"
  | string; // For cases like passing raw values

function runQuery(todoObject: TodoObject, compiledQuery: Opcode[]): boolean {
  if (!compiledQuery) {
    return true; // a null query matches everything
  }
  const stack: (boolean | number | string)[] = [];
  let operand1: boolean | undefined = undefined;
  let operand2: boolean | undefined = undefined;
  let next: string | RegExp | undefined = undefined;
  const q = compiledQuery.slice(); // shallow copy

  while (q.length > 0) {
    const opcode = q.shift() as Opcode;
    switch (opcode) {
      case "pri":
        stack.push(todoObject.priority);
        break;
      case "due":
        if (todoObject.due) {
          const d = dayjs(todoObject.due).toDate();
          stack.push(
            new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
          );
        } else {
          stack.push(undefined); // all comparisons will return false
        }
        break;
      case "duestr":
        next = q.shift();
        if (todoObject.dueString) {
          let d = dayjs(todoObject.dueString).toDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false); // no due date
        }
        break;
      case "threshold":
        if (todoObject.t) {
          const d = dayjs(todoObject.t).toDate();
          stack.push(
            new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
          );
        } else {
          stack.push(undefined); // all comparisons will return false
        }
        break;
      case "tstr":
        next = q.shift();
        if (todoObject.tString) {
          let d = dayjs(todoObject.tString).toDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next));
        } else {
          stack.push(false); // no threshold date
        }
        break;
      case "complete":
        stack.push(todoObject.complete);
        break;
      case "string":
        next = q.shift();
        stack.push(
          todoObject.string.toLowerCase().indexOf(next.toLowerCase()) !== -1,
        );
        break;
      case "regex":
        next = q.shift();
        stack.push(next.test(todoObject.string));
        break;
      case "==":
        operand2 = stack.pop() as boolean;
        operand1 = stack.pop() as boolean;
        stack.push(operand1 === operand2);
        break;
      case "!=":
        operand2 = stack.pop() as boolean;
        operand1 = stack.pop() as boolean;
        stack.push(operand1 !== operand2);
        break;
      case "<":
        operand2 = stack.pop() as number;
        operand1 = stack.pop() as number;
        stack.push(operand1 < operand2);
        break;
      case "<=":
        operand2 = stack.pop() as number;
        operand1 = stack.pop() as number;
        stack.push(operand1 <= operand2);
        break;
      case ">":
        operand2 = stack.pop() as number;
        operand1 = stack.pop() as number;
        stack.push(operand1 > operand2);
        break;
      case ">=":
        operand2 = stack.pop() as number;
        operand1 = stack.pop() as number;
        stack.push(operand1 >= operand2);
        break;
      case "++":
        next = q.shift();
        if (next === "*") {
          stack.push(todoObject.projects.length > 0);
        } else if (next.startsWith('"')) {
          stack.push(
            todoObject.projects &&
              todoObject.projects.includes(next.slice(1, -1)),
          );
        } else {
          const pattern = next?.toLowerCase();
          stack.push(
            todoObject.projects &&
              todoObject.projects.some((p) =>
                p.toLowerCase().includes(pattern || ""),
              ),
          );
        }
        break;
      case "@@":
        next = q.shift();
        if (next === "*") {
          stack.push(todoObject.contexts.length > 0);
        } else if (next.startsWith('"')) {
          stack.push(
            todoObject.contexts &&
              todoObject.contexts.includes(next.slice(1, -1)),
          );
        } else {
          const pattern = next?.toLowerCase();
          stack.push(
            todoObject.contexts &&
              todoObject.contexts.some((c) =>
                c.toLowerCase().includes(pattern || ""),
              ),
          );
        }
        break;
      case "||":
        operand2 = stack.pop() as boolean;
        operand1 = stack.pop() as boolean;
        stack.push(operand1 || operand2);
        break;
      case "&&":
        operand2 = stack.pop() as boolean;
        operand1 = stack.pop() as boolean;
        stack.push(operand1 && operand2);
        break;
      case "!!":
        operand1 = stack.pop() as boolean;
        stack.push(!operand1);
        break;
      default:
        stack.push(opcode);
        break;
    }
  }
  return stack.pop() as boolean;
}

export { runQuery };
