import { handleNotification } from '../../main/modules/Notifications';
import { config } from '../../main/config';
import { badge } from '../../main/modules/ProcessDataRequest/CreateTodoObjects';
import { Notification } from 'electron';
import dayjs from 'dayjs';

const dateToday = dayjs();
const dateTodayString = dateToday.format('YYYY-MM-DD');
const dateTomorrowString = dateToday.add(1, 'day').format('YYYY-MM-DD');
const dateInSevenDaysString = dateToday.add(7, 'day').format('YYYY-MM-DD');
const dateInTwentyDaysString = dateToday.add(20, 'day').format('YYYY-MM-DD');

jest.mock('../../main/modules/ProcessDataRequest/CreateTodoObjects', () => ({
  badge: {
    count: 0,
  },
}));

jest.mock('electron', () => ({
  Notification: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
  })),
}));

jest.mock('../../main/config', () => ({
	notifiedTodoObjectsStorage: {
		get: jest.fn(),
		set: jest.fn(),
	},
  config: {
    get: jest.fn((key) => {
      if(key === 'notificationsAllowed') {
        return true;
      } else if(key === 'notificationThreshold') {
        return 10;
      }
    }),
    set: jest.fn(),
  },
  filter: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('Notifications', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should push notification for a todo due today', () => {
		handleNotification(dateTodayString, 'Sample todo due:today', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due today', body: 'Sample todo due:today', silent: false });
		expect(badge.count).toBe(1);
	});

	test('should push notification for a todo due tomorrow', () => {
		handleNotification(dateTomorrowString, 'Sample todo due:tomorrow', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due tomorrow', body: 'Sample todo due:tomorrow', silent: false });
		expect(badge.count).toBe(2);
	});

	test('should push notification for a todo due in 7 days', () => {
		handleNotification(dateInSevenDaysString, 'Sample todo due:in 7 days', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due in 7 days', body: 'Sample todo due:in 7 days', silent: false });
		expect(badge.count).toBe(3);
	});

	test('should NOT push notification for a todo due in 20 days', () => {
		handleNotification(dateInTwentyDaysString, 'Sample todo due:in 20 days', badge);
		expect(Notification).not.toHaveBeenCalled();
		expect(badge.count).toBe(3);
	});

	test('should NOT handle notification when not allowed', () => {
	  const configGetMock = jest.fn((key) => {
	    if(key === 'notificationsAllowed') {
	      return false;
	    }
	  });
	  config.get = configGetMock;
	  handleNotification('2023-10-20', 'Sample todo', badge);
	  expect(configGetMock).toHaveBeenCalledWith('notificationsAllowed');
	  expect(Notification).not.toHaveBeenCalled();
	  expect(badge.count).toBe(3);
	});

});
