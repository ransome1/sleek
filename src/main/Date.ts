import Sugar from 'sugar'
import { MustNotify } from './Notifications'
import { SettingsStore } from '../Stores'

export function replaceSpeakingDatesWithAbsoluteDates(string: string): string {
  const speakingDates: DateAttributes = extractSpeakingDates(string)
  const due: DateAttribute = speakingDates['due:']
  const t: DateAttribute = speakingDates['t:']
  if (due.date) {
    string = string.replace(due.string!, due.date)
  }
  if (t.date) {
    string = string.replace(t.string!, t.date)
  }
  return string
}

function processDateWithSugar(string: string, type: string) {
  const words = string.split(' ');
  let combinedValue = '';
  let lastMatch = null;

  for (let index = 0; index < words.length; index++) {
    if (words[index]) combinedValue += words[index] + ' ';

    const sugarDate = Sugar.Date.create(combinedValue, { future: true });

    if (!Sugar.Date.isValid(sugarDate)) continue;

    if (type === 'absolute' || type === 'relative') {
      const isoDate = Sugar.Date(sugarDate).format('%F').raw;
      lastMatch = {
        date: isoDate,
        string: combinedValue.slice(0, -1),
        type: type,
        notify: MustNotify(sugarDate)
      };
    }
  }
  return lastMatch;
}

export function extractSpeakingDates(body: string) {
  const expressions = [
    { pattern: /due:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=t:|$)/g, key: 'due:', type: 'relative' },
    { pattern: /due:(\d{4}-\d{2}-\d{2})/g, key: 'due:', type: 'absolute' },
    { pattern: /t:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=due:|$)/g, key: 't:', type: 'relative' },
    { pattern: /t:(\d{4}-\d{2}-\d{2})/g, key: 't:', type: 'absolute' }
  ]

  const speakingDates = {
    'due:': {
      date: null,
      string: null,
      type: null,
      notify: false
    },
    't:': {
      date: null,
      string: null,
      type: null,
      notify: false
    }
  }

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`)
    const match = body.match(regex)
    if (match) {
      const attributeValue = match[0].slice(expression.key.length)
      const dateAttribute = processDateWithSugar(attributeValue, expression.type)
      speakingDates[expression.key] = dateAttribute || speakingDates[expression.key]
    }
  }

  return speakingDates
}