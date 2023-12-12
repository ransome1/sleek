import { app } from 'electron';
import { Item } from 'jstodotxt';
import dayjs from 'dayjs';
import { handleNotification } from '../HandleNotification';
import { TodoObject, DateAttributes, Badge } from '../../util';
import { extractSpeakingDates } from '../Date';

let lines: string[];
export const badge: Badge = { count: 0 };

async function createTodoObjects(fileContent: string): Promise<TodoObject[]> {
  try {
    badge.count = 0;
    lines = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');
    const items: Item[] = lines.map(line => new Item(line.replaceAll(String.fromCharCode(16), ' ')));

    const todoObjects: TodoObject[] = await Promise.all(items.map(async (JsTodoTxtObject, i) => {
      const body = JsTodoTxtObject.body();
      const speakingDates: DateAttributes = extractSpeakingDates(body);
      const due = speakingDates['due:']?.date || null;
      const dueString = speakingDates['due:']?.string || null;
      const notify = speakingDates['due:']?.notify || false;
      const t = speakingDates['t:']?.date || null;
      const tString = speakingDates['t:']?.string || null;
      const extensions = JsTodoTxtObject.extensions();
      const hidden = extensions.some(extension => extension.key === 'h' && extension.value === '1');
      const pm = extensions.find(extension => extension.key === 'pm')?.value || null;
      const rec = extensions.find(extension => extension.key === 'rec')?.value || null;
      const creation = dayjs(JsTodoTxtObject.created()).isValid() ? dayjs(JsTodoTxtObject.created()).format('YYYY-MM-DD') : null;
      const completed = dayjs(JsTodoTxtObject.completed()).isValid() ? dayjs(JsTodoTxtObject.completed()).format('YYYY-MM-DD') : null;

      const todoObject: TodoObject = {
        id: i,
        body,
        created: creation,
        complete: JsTodoTxtObject.complete(),
        completed: completed,
        priority: JsTodoTxtObject.priority(),
        contexts: JsTodoTxtObject.contexts(),
        projects: JsTodoTxtObject.projects(),
        due,
        dueString,
        notify,
        t,
        tString,
        rec,
        hidden,
        pm,
        string: lines[i],
      };

      if(due && !todoObject.complete) {
        handleNotification(i, due, body, badge);
      }

      return todoObject;
    }));

    app.setBadgeCount(badge.count);

    return Promise.resolve(todoObjects);
  } catch (error) {
    return Promise.reject(error);
  }
}

export { createTodoObjects, lines };