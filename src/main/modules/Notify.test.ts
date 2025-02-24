import { expect, test, beforeEach, describe, it, vi } from 'vitest'
import { mustNotify } from './Notify'
//import Sugar from 'sugar'
import dayjs from 'dayjs'

const today = dayjs().startOf('day')
const nextWeek = dayjs(today).add(1, 'week').toDate()

vi.mock('electron-store', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        get: vi.fn((key) => {
          if (key === 'notificationThreshold') {
            return 2;
          }
          return null;
        }),
      };
    }),
  };
});

vi.mock('electron', () => {
  return {
    app: {
      getPath: vi.fn().mockReturnValue(''),
    },
  };
});

//beforeEach(() => {
  //const today = dayjs().startOf('day')
  //const sugarDate = Sugar.Date.create(new Date, { future: true })
//});

describe('Must notify?', () => {
  it('Successful if date is today', () => {
    expect(mustNotify(today)).toBe(true);
  });
});

describe('Must notify?', () => {
  it('Fails if date is next week', () => {
    expect(mustNotify(nextWeek)).toBe(false);
  });
});