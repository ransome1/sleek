import { app } from 'electron';
import { Item } from 'jstodotxt';
import { handleNotification } from '../Notifications';
import { extractSpeakingDates } from '../Date';
import { configStorage } from '../../config';
import dayjs from 'dayjs';

let lines: string[];
export const badge: Badge = { count: 0 };

function createTodoObject(string: string, index: number): TodoObject {
  const content = string.replaceAll(/[\x10\r\n]/g, ' ');
  const JsTodoTxtObject = new Item(content);
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
  return {
    id: index,
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
    string: string,
  };
}

async function createTodoObjects(fileContent: string | null): Promise<TodoObject[] | []> {
  if(!fileContent) {
    lines = [];
    return [];
  }
  badge.count = 0;
  lines = fileContent.split(/[\r\n]+/).filter(line => line.trim() !== '');
  
  const todoObjects: TodoObject[] = await Promise.all(lines.map(async (line, i) => {
    const todoObject: TodoObject = await createTodoObject(line, i);
    if(todoObject.due && todoObject.body && !todoObject.complete) {
      handleNotification(todoObject.due, todoObject.body, badge);
    }
    return todoObject;
  }));

  app.setBadgeCount(badge.count);

  return todoObjects;
}

export { createTodoObjects, createTodoObject, lines };
