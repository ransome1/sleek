import { extractSpeakingDates, replaceSpeakingDatesWithAbsoluteDates } from '../../main/modules/Date';
import { writeTodoObjectToFile } from '../../main/modules/WriteToFile';
import dayjs from 'dayjs';

jest.mock('../../main/modules/WriteToFile', () => ({
  writeTodoObjectToFile: jest.fn(),
}));

const currentDate = dayjs();
const nextMonday = currentDate.add(1, 'week').startOf('week').add(1, 'day');
const formattedNextMonday = nextMonday.format('YYYY-MM-DD');

describe('extractSpeakingDates', () => {
  it('should extract due date in absolute format', () => {
    const body = 'Test due:2023-09-13';
    const result = extractSpeakingDates(body);
    expect(result['due:']).toEqual({
      date: '2023-09-13',
      string: '2023-09-13',
      type: 'absolute',
    });
  });

  it('should extract t date in relative format', () => {
    const body = 'Test t:next Monday';
    const result = extractSpeakingDates(body);
    expect(result['t:']).toEqual({
      date: formattedNextMonday,
      string: 'next Monday',
      type: 'relative',
    });
  });

  it('should extract due date in relative format', () => {
    const body = 'Test due:Sunday, January 15th 2012';
    const result = extractSpeakingDates(body);
    expect(result['due:']).toEqual({
      date: '2012-01-15',
      string: 'Sunday, January 15th 2012',
      type: 'relative',
    });
  });  

});

describe('replaceSpeakingDatesWithAbsoluteDates', () => {
  it('should replace due date with absolute date', () => {
    const body = 'Test due:2023-09-13';
    const result = replaceSpeakingDatesWithAbsoluteDates(body);
    expect(result).toBe('Test due:2023-09-13');
  });

  it('should replace t date with absolute date', () => {
    const body = 'Test t:next Monday';
    const result = replaceSpeakingDatesWithAbsoluteDates(body);
    expect(result).toBe('Test t:' + formattedNextMonday);
  });

});
