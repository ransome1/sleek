import { Item } from 'jstodotxt';
import { handleNotification } from './HandleNotification';
import dayjs from 'dayjs';
import Sugar from 'sugar';
import { TodoObject, DateAttribute } from '../util';
import { addRecurrenceToDate } from './CreateRecurringTodo';

let lines: string[];

function processDateWithSugar(string: string, key: string, type: string): any {
  const array = string.split(' ');
  let index = 0;
  let combinedValue = '';
  let lastMatch;

  while (index < array.length) {

    if(array[index]) combinedValue += array[index] + ' ';

    const sugarDate = Sugar.Date.create(combinedValue);

    if(Sugar.Date.isValid(sugarDate)) {
      lastMatch = {
        key: key,
        date: dayjs(sugarDate).format('YYYY-MM-DD'),
        string: combinedValue.slice(0, -1)
      }
    } else if(type === 'relative') {
      const now = new Date();
      const relativeDate = addRecurrenceToDate(now, string);
      lastMatch = {
        key: key,
        date: dayjs(relativeDate).format('YYYY-MM-DD'),
        string: string
      }
    }
    index++;
  }
  return lastMatch;
}

function extractSpeakingDates(body: string): any {
  const expressions = [
    { pattern: /due:(.*?)(?=t:|$)/g, key: 'due:', type: 'absolute' },
    { pattern: /due:(\d+[dwm])/g, key: 'due:', type: 'relative' },
    { pattern: /t:(.*?)(?=due:|$)/g, key: 't:', type: 'absolute' },
    { pattern: /t:(\d+[dwm])/g, key: 't:', type: 'relative' },
  ];

  const speakingDates = [];

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`);
    const match = body.match(regex);
    if(match) {
      const attributeValue = match[0].substr(expression.key.length);
      speakingDates.push(processDateWithSugar(attributeValue, expression.key, expression.type));
    }
  }
  return speakingDates;
}

function createTodoObjects(fileContent: string): TodoObject[] {
  lines = fileContent.split('\n');
  const todoObjects: TodoObject[] = lines
    .map((line, i) => {
      const item = new Item(line);
      const body = item.body();
      if (!body) {
        return null;
      }
      const speakingDates: DateAttribute[] = extractSpeakingDates(body);
      const due = speakingDates.find(speakingDate => speakingDate?.key === 'due:')?.date ?? null;
      const dueString = speakingDates.find(speakingDate => speakingDate?.key === 'due:')?.string ?? null;
      const t = speakingDates.find(speakingDate => speakingDate?.key === 't:')?.date ?? null;
      const tString = speakingDates.find(speakingDate => speakingDate?.key === 't:')?.string ?? null;
      
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
      }
      return todoObject as TodoObject;
    })
    .filter((todoObject): todoObject is TodoObject => todoObject !== null);
  return todoObjects;
}

export { createTodoObjects, lines };
