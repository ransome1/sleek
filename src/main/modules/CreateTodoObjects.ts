import { Item } from 'jstodotxt';
import { handleNotification } from './HandleNotification';
import dayjs from 'dayjs';
import Sugar from 'sugar';
import { TodoObject, DateAttribute } from '../util';

let lines: string[];

function processDateWithSugar(string: string, key: string): any {
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
    }
    index++;
  }
  return lastMatch;
}

function extractSpeakingDates(body: string): any {
  const expressions = [
    { pattern: /due:(.*?)(?=t:|$)/g, key: 'due:' },
    { pattern: /t:(.*?)(?=due:|$)/g, key: 't:' },
  ];

  const speakingDates = [];

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`);
    const match = body.match(regex);
    if(match) {
      const value = match[0].substr(expression.key.length);
      speakingDates.push(processDateWithSugar(value, expression.key));
    }
  }
  return speakingDates;
}

function createTodoObjects(fileContent: string): TodoObject[] {
  lines = fileContent.split('\n');
  const todoObjects: TodoObject[] = lines
    .map((line, i) => {
      const item = new Item(line);
      if (!item.body()) {
        return null;
      }

      const speakingDates: DateAttribute[] = extractSpeakingDates(item.body());

      const due = speakingDates.find(speakingDate => speakingDate.key === 'due:')?.date || null;
      const dueString = speakingDates.find(speakingDate => speakingDate.key === 'due:')?.string || null;
      const t = speakingDates.find(speakingDate => speakingDate.key === 't:')?.date || null;
      const tString = speakingDates.find(speakingDate => speakingDate.key === 't:')?.string || null;
      const body = item.body();
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
