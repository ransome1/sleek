import dayjs from 'dayjs';
import { handleNotification, sendNotification, notifiedTodoObjects } from '../../main/modules/HandleNotification';

// Mock the Notification constructor
jest.mock('electron', () => ({
  Notification: jest.fn((options) => ({
    show: jest.fn(),
  })),
}));

jest.mock('../../main/modules/HandleNotification', () => ({
  ...jest.requireActual('.../../main/modules/HandleNotification'), // Use the actual implementation from the module
  sendNotification: jest.fn(), // Mock the sendNotification function
}));

describe('handleNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mock function calls before each test
    notifiedTodoObjects.clear(); // Clear the set before each test
  });

  test('should send a notification for a due date today', () => {
    const body = 'Todo item due today';

    handleNotification(1, '2023-07-25', body);

    expect(sendNotification).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith('Due today', body);
  });
});
