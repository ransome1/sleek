import { handleNotification, sendNotification } from '../../main/modules/HandleNotification';
import { configStorage } from '../../main/config';
import { badge } from '../../main/modules/TodoObject/CreateTodoObjects';
import { Notification } from 'electron';
import dayjs from 'dayjs';

const dateToday = dayjs();
const dateTodayString = dateToday.format('YYYY-MM-DD');
const dateTomorrowString = dateToday.add(1, 'day').format('YYYY-MM-DD');
const dateInSevenDaysString = dateToday.add(7, 'day').format('YYYY-MM-DD');
const dateInTwentyDaysString = dateToday.add(20, 'day').format('YYYY-MM-DD');

jest.mock('../../main/modules/TodoObject/CreateTodoObjects', () => ({
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
  configStorage: {
    get: jest.fn((key) => {
      if (key === 'notificationsAllowed') {
        return true;
      } else if (key === 'notificationThreshold') {
        return 10;
      }
    }),
    set: jest.fn(),
  },
}));

describe('Notifications', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('should push notification for a todo due today', () => {
		handleNotification(1, dateTodayString, 'Sample todo due:today', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due today', body: 'Sample todo due:today', silent: false });
		expect(badge.count).toBe(1);
	});

	test('should push notification for a todo due tomorrow', () => {
		handleNotification(2, dateTomorrowString, 'Sample todo due:tomorrow', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due tomorrow', body: 'Sample todo due:tomorrow', silent: false });
		expect(badge.count).toBe(2);
	});

	test('should push notification for a todo due in 7 days', () => {
		handleNotification(3, dateInSevenDaysString, 'Sample todo due:in 7 days', badge);
		expect(Notification).toHaveBeenCalledWith({ title: 'Due in 7 days', body: 'Sample todo due:in 7 days', silent: false });
		expect(badge.count).toBe(3);
	});

	test('should NOT push notification for a todo due in 20 days', () => {
		handleNotification(4, dateInTwentyDaysString, 'Sample todo due:in 20 days', badge);
		expect(Notification).not.toHaveBeenCalled();
		expect(badge.count).toBe(3);
	});    

	test('should NOT handle notification when not allowed', () => {
	  const configStorageGetMock = jest.fn((key) => {
	    if (key === 'notificationsAllowed') {
	      return false;
	    }
	  });
	  configStorage.get = configStorageGetMock;
	  handleNotification(5, '2023-10-20', 'Sample todo', badge);
	  expect(configStorageGetMock).toHaveBeenCalledWith('notificationsAllowed');
	  expect(Notification).not.toHaveBeenCalled();
	  expect(badge.count).toBe(3);
	});

});
