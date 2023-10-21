import { app } from 'electron';
import { Item } from 'jstodotxt';
import dayjs from 'dayjs';
import { handleNotification } from '../HandleNotification';
import { TodoObject, DateAttributes } from '../../util';
import { extractSpeakingDates } from '../Date';

let lines: string[];
const badgeCount = { count: 0 };

function createTodoObjects(fileContent: string): TodoObject[] {
  badgeCount.count = 0;
  lines = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');
  const todoObjects: TodoObject[] = lines
  .map((line, i) => {
    try {
      const updatedLine = line.replaceAll(String.fromCharCode(16), ` `)
      const JsTodoTxtObject = new Item(updatedLine);
      const body = JsTodoTxtObject.body();
      if (!body) {
        return null;
      }
      const speakingDates: DateAttributes = extractSpeakingDates(body);
      const due = speakingDates['due:'] ? speakingDates['due:'].date : null;
      const dueString = speakingDates['due:'] ? speakingDates['due:'].string : null;
      const t = speakingDates['t:'] ? speakingDates['t:'].date : null;
      const tString = speakingDates['t:'] ? speakingDates['t:'].string : null;
      const extensions = JsTodoTxtObject.extensions();
      const hidden = extensions.find((extension) => extension.key === 'h')?.value === '1' ? true : false;
      const pm = extensions.find((extension) => extension.key === 'pm')?.value || null;
      const rec = extensions.find((extension) => extension.key === 'rec')?.value || null;
      const creation = dayjs(JsTodoTxtObject.created()).isValid() ? dayjs(JsTodoTxtObject.created()).format('YYYY-MM-DD') : null;
      const completed = dayjs(JsTodoTxtObject.completed()).isValid() ? dayjs(JsTodoTxtObject.completed()).format('YYYY-MM-DD') : null;
      
      const todoObject = {
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
        t,
        tString,
        rec,
        hidden,
        pm,
        string: line,
      };
      if(due && !todoObject.complete) handleNotification(i, due, body, badgeCount);
      return todoObject as TodoObject;
    } catch (error) {
      console.log(error);
      return null;
    }
  })
  .filter((todoObject): todoObject is TodoObject => todoObject !== null);
  app.setBadgeCount(badgeCount.count);
  return todoObjects;
}

export { createTodoObjects, lines };
