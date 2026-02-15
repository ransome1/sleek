import { TodoObject } from "@sleek-types";
import { DateTime } from "luxon";

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
  const stack: (boolean | number | string | undefined)[] = [];
  let operand1: boolean | number | undefined = undefined;
  let operand2: boolean | number | undefined = undefined;
  let next: string | RegExp | undefined = undefined;
  const q = compiledQuery.slice(); // shallow copy

  while (q.length > 0) {
    const opcode = q.shift() as Opcode;
    switch (opcode) {
      case "pri":
        stack.push(todoObject.priority!);
        break;
      case "due":
        if (todoObject.due) {
          const d = DateTime.fromISO(todoObject.due).toJSDate();
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
          let d = DateTime.fromISO(todoObject.dueString).toJSDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next!));
        } else {
          stack.push(false); // no due date
        }
        break;
      case "threshold":
        if (todoObject.t) {
          const d = DateTime.fromISO(todoObject.t).toJSDate();
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
          let d = DateTime.fromISO(todoObject.tString).toJSDate();
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          stack.push(d.toISOString().slice(0, 10).startsWith(next!));
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
          todoObject.string.toLowerCase().indexOf(next!.toLowerCase()) !== -1,
        );
        break;
      case "regex":
        next = q.shift();
        if (!next) break;
        stack.push(new RegExp(next).test(todoObject.string));
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
        if (!next || !todoObject.projects) break;
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
        if (!next || !todoObject.contexts) break;
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
