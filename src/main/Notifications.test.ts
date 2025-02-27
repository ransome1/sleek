import { expect, test, beforeEach, afterEach, describe, it, vi } from 'vitest'
import { MustNotify, CreateTitle, SuppressNotification, HandleNotification } from './Notifications'
import dayjs from 'dayjs'
import { Notification } from 'electron';

const today = dayjs().startOf('day')
const tomorrow = dayjs(today).add(1, 'day')
const inOneWeek = dayjs(today).add(1, 'week')
const lastWeek = dayjs(today).subtract(1, 'week')
const inFourDays = dayjs(today).add(4, 'day')

vi.mock('./Stores', () => {
  return {
    SettingsStore: {
      get: vi.fn((key) => {
        if (key === 'notificationThreshold') {
          return 5;
        }
        return null;
      }),
    },
    FiltersStore: {
      get: vi.fn((key) => {
        if (key === 'search') {
          return [{
            label: `due: > ${dayjs(today).format('YYYY-MM-DD')} && due: < ${dayjs(inFourDays).format('YYYY-MM-DD')}`,
            suppress: true,
          }];
        }
        return null;
      }),
    },
    NotificationsStore: {
      get: vi.fn(() => [
        '80ec2a9b5c90483a077107a7c67b97859c3201f3551aef3e752bfa03f8eb3e6b',
        'd501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f',
      ]),
      set: vi.fn(),
    },
  };
});

vi.mock('./index.js', () => {
  return {
    mainWindow: {
      webContents: {
        send: vi.fn(),
      },
    },
  };
});

vi.mock(import("./Notifications"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual
  }
})

vi.mock('path', () => {
  return {
    default: {
      join: vi.fn(),
    },
  };
});

vi.mock('electron', () => {
  return {
    Notification: vi.fn().mockImplementation(() => {
      return {
        show: vi.fn(),
      };
    }),
    app: {
      getPath: vi.fn().mockReturnValue(''),
    },
  };
});

describe('MustNotify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Successful if date is today', () => {
    expect(MustNotify(today)).toBe(true);
  });

  it('Fails if date is next week', () => {
    expect(MustNotify(inOneWeek)).toBe(false);
  });
});

describe('CreateTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('`Due today` if due date is today', () => {
    expect(CreateTitle(today)).toBe('Due today');
  });
  it('`Due tomorrow` if due date is tomorrow', () => {
    expect(CreateTitle(tomorrow)).toBe('Due tomorrow');
  });
  it('`Due in 7 days` if due date is in 7 days from today', () => {
    expect(CreateTitle(inOneWeek)).toBe('Due in 7 days');
  });
  it('`Due in 4 days` if due date is in 4 days from today', () => {
    expect(CreateTitle(inFourDays)).toBe('Due in 4 days');
  });
});

describe('SuppressNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Suppressed when hash is found in hash list', () => {
    expect(SuppressNotification(today, '', 'd501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f')).toBe(true);
  });
  it('Not suppressed when hash is not found in hash list', () => {
    expect(SuppressNotification(today, '', '21e121097b76efe0af72eb9a050efb20f2b8415c726378edabdc60f131720a16')).toBe(false);
  });
  it('Not suppressed when due date is between today and threshold date', () => {
    expect(SuppressNotification(inFourDays, '', '')).toBe(false);
  });
  it('Suppressed when due date is after threshold date', () => {
    expect(SuppressNotification(inOneWeek, '', '')).toBe(true);
  });
  it('Suppressed when due date is in last week', () => {
    expect(SuppressNotification(lastWeek, '', '')).toBe(true);
  });
  it('Suppressed by search filter when due date is matched', () => {
    expect(SuppressNotification(tomorrow, `due:${dayjs(tomorrow).format('YYYY-MM-DD')}`, '')).toBe(true);
  });
  it('Not suppressed by search filter when due date is not matched', () => {
    expect(SuppressNotification(inFourDays, `due:${dayjs(inFourDays).format('YYYY-MM-DD')}`, '')).toBe(false);
  });
});

describe('HandleNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Notification is triggered if due date is today', () => {
    const badge = { count: 0 };
    HandleNotification(today, `due:${dayjs(today).format('YYYY-MM-DD')}`, badge);

    expect(badge.count).toBe(1);
    expect(Notification).toHaveBeenCalled();
  });
  it('No notification is triggered if due date is last week, but badge count is increased', () => {
    const badge = { count: 0 };
    HandleNotification(lastWeek, `due:${dayjs(lastWeek).format('YYYY-MM-DD')}`, badge);

    expect(badge.count).toBe(1);
    expect(Notification).not.toHaveBeenCalled();
  });
  it('No notification is triggered if due date is next week and badge count is not increased', () => {
    const badge = { count: 0 };
    HandleNotification(inOneWeek, `due:${dayjs(inOneWeek).format('YYYY-MM-DD')}`, badge);

    expect(badge.count).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });
  it('No notification is triggered and no badge count is increased if due date is not set', () => {
    const badge = { count: 0 };
    HandleNotification(null, `due:${dayjs(inOneWeek).format('YYYY-MM-DD')}`, badge);

    expect(badge.count).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });  
});