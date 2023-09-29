import { Item } from 'jstodotxt';
import dayjs from 'dayjs';
import { handleNotification } from '../HandleNotification';
import { TodoObject, DateAttributes } from '../../util';
import { extractSpeakingDates } from '../Date';


let lines: string[];

function createTodoObjects(fileContent: string): TodoObject[] {
  lines = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');
  const todoObjects: TodoObject[] = lines
    .map((line, i) => {
      try {
        const item = new Item(line);
        const body = item.body();
        if (!body) {
          return null;
        }
        const speakingDates: DateAttributes = extractSpeakingDates(body);

        const due = speakingDates['due:'] ? speakingDates['due:'].date : null;
        const dueString = speakingDates['due:'] ? speakingDates['due:'].string : null;
        const t = speakingDates['t:'] ? speakingDates['t:'].date : null;
        const tString = speakingDates['t:'] ? speakingDates['t:'].string : null;
        
        const extensions = item.extensions();
        const hidden = extensions.find((extension) => extension.key === 'h')?.value === '1' ? true : false;
        const pm = extensions.find((extension) => extension.key === 'pm')?.value || null;
        const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
        const creation = dayjs(item.created()).isValid() ? dayjs(item.created()).format('YYYY-MM-DD') : null;
        const completed = dayjs(item.completed()).isValid() ? dayjs(item.completed()).format('YYYY-MM-DD') : null;

        if(due) handleNotification(i, due, body);

        const todoObject = {
          id: i,
          body,
          created: creation,
          complete: item.complete(),
          completed: completed,
          priority: item.priority(),
          contexts: item.contexts(),
          projects: item.projects(),
          due,
          dueString,
          t,
          tString,
          rec,
          hidden,
          pm,
          string: item.toString(),
        };

        return todoObject as TodoObject;
      } catch (error) {
        console.log(error);
        return null;
      }
    })
    .filter((todoObject): todoObject is TodoObject => todoObject !== null);

  return todoObjects;
}

export { createTodoObjects, lines };
