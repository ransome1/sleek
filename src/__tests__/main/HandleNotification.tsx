import dayjs from 'dayjs';
import { handleNotification, sendNotification, notifiedTodoObjects } from '../../main/modules/HandleNotification';

// Mock the electron module
jest.mock('electron', () => ({
  Notification: jest.fn((options) => ({
    show: jest.fn(),
  })),
}));

jest.mock('../../main/modules/HandleNotification', () => ({
  ...jest.requireActual('../../main/modules/HandleNotification'), // Keep the real implementation
  sendNotification: jest.fn(), // Mock the sendNotification function
}));

describe('handleNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notifiedTodoObjects.clear();
  });

  test('should send a notification for a due date today', () => {

    handleNotification(1, '2023-07-26', 'Todo item due today');

    expect(sendNotification).toHaveBeenCalledTimes(1);
    //expect(sendNotification).toHaveBeenCalledWith('Due today', body);

    // Check if the Notification constructor was called with the correct parameters
    // expect(require('electron').Notification).toHaveBeenCalledTimes(1);
    // expect(require('electron').Notification).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     title: 'Due today',
    //     body,
    //   })
    // );

    // Check if the show method of the notification was called
    // const notificationInstance = new (require('electron').Notification)();
    // expect(notificationInstance.show).toHaveBeenCalledTimes(1);
  });
});
