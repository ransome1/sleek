import { Item } from 'jstodotxt';
import { configStorage } from '../config';
import { handleNotification } from './HandleNotification';

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
  group: null;
}

function createTodoObjects(fileContent: string): TodoObject[] {
  const appendCreationDate = configStorage.get('appendCreationDate');

  lines = fileContent.split('\n');
  const todoObjects: TodoObject[] = lines
    .map((line, i) => {
      const item = new Item(line);
      if (!item.created()) item.setCreated(appendCreationDate ? new Date() : null);

      const body = item.body();
      const extensions = item.extensions();
      const due = extensions.find((extension) => extension.key === 'due')?.value || null;
      //const tags = extensions.find((extension) => extension.key === 'tag')?.value || null;
      const t = extensions.find((extension) => extension.key === 't')?.value || null;
      const hidden = extensions.find((extension) => extension.key === 'h')?.value || null;
      const pm = extensions.find((extension) => extension.key === 'pm')?.value || null;
      const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
      if (!item.body()) {
        return null;
      }

      if(due) handleNotification(i, due, body);

      return {
        id: i,
        body,
        created: item.created(),
        complete: item.complete(),
        completed: item.completed(),
        priority: item.priority(),
        contexts: item.contexts(),
        projects: item.projects(),
        due,
        t,
        rec,
        hidden,
        //tags,
        pm,
        string: item.toString(),
        group: null,
      } as TodoObject;
    })
    .filter((todoObject): todoObject is TodoObject => todoObject !== null);
  return todoObjects;
}

export { createTodoObjects, lines };
