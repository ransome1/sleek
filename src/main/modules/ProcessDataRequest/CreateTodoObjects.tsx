import { app } from 'electron';
import { Item } from 'jstodotxt';
import { config } from '../../config';
import { handleNotification } from '../Notifications';
import { extractSpeakingDates } from '../Date';
import dayjs from 'dayjs';

let lines: string[];
export const badge: Badge = { count: 0 };

function createTodoObject(index: number, string: string, attributeType?: string, attributeValue?: string): TodoObject {
  let content = string.replaceAll(/[\x10\r\n]/g, ' [LB] ');
  
  let JsTodoTxtObject = new Item(content);

  const extensions = JsTodoTxtObject.extensions();

  if(attributeType) {
    if(attributeType === 'priority') {
      const value = (attributeValue === '-') ? null : attributeValue;
      JsTodoTxtObject.setPriority(value);
    } else {
      if(!attributeValue) {
        JsTodoTxtObject.removeExtension(attributeType);
      } else {
        JsTodoTxtObject.setExtension(attributeType, attributeValue);
      }
    }
  }

  content = JsTodoTxtObject.toString().replaceAll(' [LB] ', String.fromCharCode(16));

  const body = JsTodoTxtObject.body().replaceAll(' [LB] ', ' ');
  const speakingDates: DateAttributes = extractSpeakingDates(body);
  const due = speakingDates['due:']?.date || null;
  const dueString = speakingDates['due:']?.string || null;
  const notify = speakingDates['due:']?.notify || false;
  const t = speakingDates['t:']?.date || null;
  const tString = speakingDates['t:']?.string || null;
  
  const hidden = extensions.some(extension => extension.key === 'h' && extension.value === '1');
  const pm: string | number | null = extensions.find(extension => extension.key === 'pm')?.value || null;
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
    visible: true,
    string: content,
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
    
    const excludeLinesWithPrefix: string = config.get('excludeLinesWithPrefix');
    if (line.startsWith(excludeLinesWithPrefix)) {
      return null;
    }

    const todoObject: TodoObject = await createTodoObject(i, line);

    if (todoObject.body && !todoObject.complete) {
      handleNotification(todoObject.due, todoObject.body, badge);
    }

    return todoObject;
  })).then((objects) => objects.filter(Boolean) as TodoObject[]);

  app.setBadgeCount(badge.count);

  return todoObjects;
}

export { createTodoObjects, createTodoObject, lines };
