import { Item } from 'jstodotxt';
import { handleNotification } from './HandleNotification';
import dayjs from 'dayjs';

let lines: string[];

interface TodoObject {
  id: number;
  body: string;
  created: Date | null;
  complete: boolean;
  completed: Date | null;
  priority: string | null;
  contexts: string[];
  projects: string[];
  due: string | null;
  t: string | null;
  rec: string | null;
  hidden: string | null;
  pm: string | null;
  string: string;
}

function createTodoObjects(fileContent: string): TodoObject[] {
  lines = fileContent.split('\n');
  const todoObjects: TodoObject[] = lines
    .map((line, i) => {
      const item = new Item(line);
      const body = item.body();
      const extensions = item.extensions();
      const due = extensions.find((extension) => extension.key === 'due')?.value || null;
      const t = extensions.find((extension) => extension.key === 't')?.value || null;
      const hidden = extensions.find((extension) => extension.key === 'h')?.value === '1' ? true : false;
      const pm = extensions.find((extension) => extension.key === 'pm')?.value || null;
      const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
      const creation = dayjs(item.created()).isValid() ? dayjs(item.created()).format('YYYY-MM-DD') : null;
      const completed = dayjs(item.completed()).isValid() ? dayjs(item.completed()).format('YYYY-MM-DD') : null;
      if (!item.body()) {
        return null;
      }

      if(due) handleNotification(i, due, body);

      return {
        id: i,
        body,
        created: creation,
        complete: item.complete(),
        completed: completed,  
        priority: item.priority(),
        contexts: item.contexts(),
        projects: item.projects(),
        due,
        t,
        rec,
        hidden,
        pm,
        string: item.toString(),
      } as TodoObject;
    })
    .filter((todoObject): todoObject is TodoObject => todoObject !== null);
  return todoObjects;
}

export { createTodoObjects, lines };
