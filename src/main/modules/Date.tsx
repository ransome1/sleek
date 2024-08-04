import Sugar from 'sugar';
import dayjs, { Dayjs } from 'dayjs';
import { config } from '../config';

function mustNotify(date: Date): boolean {
  const today = dayjs().startOf('day');
  const notificationThreshold: number = config.get('notificationThreshold');
  return dayjs(date).isBefore(today.add(notificationThreshold, 'day')) || false;
}

function replaceSpeakingDatesWithAbsoluteDates(string: string): string {
  const speakingDates: DateAttributes = extractSpeakingDates(string);
  const due: DateAttribute = speakingDates['due:'];
  const t: DateAttribute = speakingDates['t:'];
  if(due.date) {
    string = string.replace(due.string!, due.date);
  }
  if(t.date) {
    string = string.replace(t.string!, t.date);
  }
  return string;
}

function processDateWithSugar(string: string, type: string): DateAttribute | null {
  const array = string.split(' ');
  let index = 0;
  let combinedValue = '';
  let lastMatch = null;

  while (index < array.length) {
    if(array[index]) combinedValue += array[index] + ' ';
    const sugarDate = Sugar.Date.create(combinedValue, {future: true});
    if(Sugar.Date.isValid(sugarDate) && type === 'absolute') {
      lastMatch = {
        date: dayjs(sugarDate).format('YYYY-MM-DD'),
        string: combinedValue.slice(0, -1),
        type: type,
        notify: mustNotify(sugarDate),
      };
    } else if(Sugar.Date.isValid(sugarDate) && type === 'relative') {
      lastMatch = {
        date: dayjs(sugarDate).format('YYYY-MM-DD'),
        string: combinedValue.slice(0, -1),
        type: type,
        notify: mustNotify(sugarDate),
      };
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
      type: null,
      notify: false,
    },
    't:': {
      date: null,
      string: null,
      type: null,
      notify: false,
    }
  };

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`);
    const match = body.match(regex);
    if(match) {
      const attributeValue = match[0].slice(expression.key.length);
      const dateAttribute = processDateWithSugar(attributeValue, expression.type);
      speakingDates[expression.key] = dateAttribute || speakingDates[expression.key];
    }
  }

  return speakingDates;
}

function friendlyDateGroup(date: Dayjs): FriendlyDateGroup | null {
  const today = dayjs();

  if (!date || !date.isValid()) {
    return null;
  }

  if (date.isBefore(today.subtract(1, 'week'))) {
    return 'before-last-week';
  }

  if (date.isBefore(today.subtract(1, 'day'))) {
    return 'last-week';
  }

  if (date.isBefore(today)) {
    return 'yesterday';
  }

  if (date.isSame(today)) {
    return 'today';
  }

  if (date.isSame(today.add(1, 'day'))) {
    return 'tomorrow';
  }

  if (date.isBefore(today.add(1, 'week').add(1, 'day'))) {
    return 'this-week';
  }

  if (date.isBefore(today.add(2, 'week').add(1, 'day'))) {
    return 'next-week';
  }

  if (date.isBefore(today.add(1, 'month').add(1, 'day'))) {
    return 'this-month';
  }

  if (date.isBefore(today.add(2, 'month').add(1, 'day'))) {
    return 'next-month';
  }

  return 'after-next-month';
}

export {
  extractSpeakingDates,
  friendlyDateGroup,
  replaceSpeakingDatesWithAbsoluteDates
};
