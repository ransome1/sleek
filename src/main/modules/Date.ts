import Sugar from 'sugar';
import dayjs from 'dayjs';
import { addRecurrenceToDate } from './CreateRecurringTodo';
import { DateAttribute, DateAttributes } from '../util';

function replaceSpeakingDatesWithAbsoluteDates(string: string): string {
  const speakingDates: DateAttributes = extractSpeakingDates(string);
  const due: DateAttribute = speakingDates['due:'];
  const t: DateAttribute = speakingDates['t:'];

  if(due.date) {
    string = string.replace(due.string, due.date);
  }
  if(t.date) {
    string = string.replace(t.string, t.date);
  }
  return string;
}

function processDateWithSugar(string: string, key: string, type: string): DateAttribute {
  const array = string.split(' ');
  let index = 0;
  let combinedValue = '';
  let lastMatch = null;

  while (index < array.length) {

    if(array[index]) combinedValue += array[index] + ' ';

    const sugarDate = Sugar.Date.create(combinedValue);

    if(Sugar.Date.isValid(sugarDate)) {
      lastMatch = {
        date: dayjs(sugarDate).format('YYYY-MM-DD'),
        string: combinedValue.slice(0, -1),
        type: type
      }
    } else if(type === 'relative') {
      const now = new Date();
      const relativeDate = addRecurrenceToDate(now, string);
      lastMatch = {
        date: dayjs(relativeDate).format('YYYY-MM-DD'),
        string: string,
        type: type
      }
    }
    index++;
  }
  return lastMatch;
}

function extractSpeakingDates(body: string): DateAttributes {
  const expressions = [
    { pattern: /due:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=t:|$)/g, key: 'due:', type: 'relative' },
    { pattern: /due:(\d{4}-\d{2}-\d{2})/g, key: 'due:', type: 'absolute' },
    { pattern: /t:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=due:|$)/g, key: 't:', type: 'relative' },
    { pattern: /t:(\d{4}-\d{2}-\d{2})/g, key: 't:', type: 'absolute' },
  ];

  const speakingDates: DateAttributes = {
    'due:': { 
      date: null,
      string: null,
      type: null 
    },
    't:': {
      date: null,
      string: null,
      type: null 
    }
  };

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`);
    const match = body.match(regex);
    if(match) {
      const attributeValue = match[0].substr(expression.key.length);
      speakingDates[expression.key] = processDateWithSugar(attributeValue, expression.key, expression.type);
    }
  }

  return speakingDates;
}

export { extractSpeakingDates, replaceSpeakingDatesWithAbsoluteDates };