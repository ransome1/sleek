import { expect, test, beforeEach, afterEach, describe, it, vi } from 'vitest'
import { MustNotify, CreateTitle, SuppressNotification, HandleNotification } from './Notifications'
import dayjs from 'dayjs'
import { Notification } from 'electron';

const today = dayjs().startOf('day')
const tomorrow = dayjs(today).add(1, 'day')
const inOneWeek = dayjs(today).add(1, 'week')
const lastWeek = dayjs(today).subtract(1, 'week')
const inFourDays = dayjs(today).add(4, 'day')

const notifiedTodoObjects = [
  '80ec2a9b5c90483a077107a7c67b97859c3201f3551aef3e752bfa03f8eb3e6b',
  'd501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f',
]
vi.mock('./Stores/SettingsStore', () => {
  return {
    SettingsStore: {
      get: vi.fn((key) => {
        if (key === 'notificationThreshold') {
          return 2;
        }
        return null;
      }),
    }
  };
});

vi.mock('./Stores/FiltersStore', () => {
  return {
    FiltersStore: {
      get: vi.fn((key) => {
        if (key === 'search') {
          return [{
            "label": `due: > ${dayjs(today).format('YYYY-MM-DD')} && due: < ${dayjs(inFourDays).format('YYYY-MM-DD')}`,
            "suppress": true
          }];
        }
        return null;
      }),
    }
  };
});

vi.mock('./Stores/NotificationsStore', () => {
  return {
    NotificationsStore: {
      get: vi.fn(),
      set: vi.fn()
    }
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

// vi.mock('./Notifications.js', () => {
//   return {
//     checkForSearchMatches: vi.fn((key) => {
//       return true;
//     });
//   };
// });

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
  it('`Today` if due date is today', () => {
    expect(CreateTitle(today)).toBe('Due today');
  });

  it('`Due in 7 days` if due date is in 7 days', () => {
    expect(CreateTitle(inOneWeek)).toBe('Due in 7 days');
  });

  it('`Due in 4 days` if due date is in 4 days today', () => {
    expect(CreateTitle(inFourDays)).toBe('Due in 4 days');
  });
});

describe('SuppressNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Suppressed when hash is found in hash list', () => {
    expect(SuppressNotification(today, today, '', notifiedTodoObjects, 'd501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f', 2)).toBe(true);
  });
  it('Not suppressed when hash is not found in hash list', () => {
    expect(SuppressNotification(today, today, '', notifiedTodoObjects, '21e121097b76efe0af72eb9a050efb20f2b8415c726378edabdc60f131720a16', 2)).toBe(false);
  });
  it('Not suppressed when due date is between today and threshold date', () => {
    expect(SuppressNotification(inFourDays, today, '', notifiedTodoObjects, '', 8 )).toBe(false);
  });
  it('Suppressed when due date is after threshold date', () => {
    expect(SuppressNotification(inOneWeek, today, '', notifiedTodoObjects, '', 2 )).toBe(true);
  });
  it('Suppressed when due date is in last week', () => {
    expect(SuppressNotification(lastWeek, today, '', notifiedTodoObjects, '', 2 )).toBe(true);
  });
  it('Suppressed by search filter when due date is matched', () => {
    expect(SuppressNotification(tomorrow, today, `due:${dayjs(tomorrow).format('YYYY-MM-DD')}`, notifiedTodoObjects, '', 4 )).toBe(true);
  });
  it('Not suppressed by search filter when due date is not matched', () => {
    expect(SuppressNotification(inOneWeek, today, `due:${dayjs(inOneWeek).format('YYYY-MM-DD')}`, notifiedTodoObjects, '', 20 )).toBe(false);
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
});