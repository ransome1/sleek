import { Notification } from 'electron';
import { configStorage } from '../config';
import { userTimeZone } from '../util';
import dayjs from 'dayjs';
const isToday = require('dayjs/plugin/isToday');
const isTomorrow = require('dayjs/plugin/isTomorrow');
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

export const notifiedTodoObjects = new Set<number>();

export const sendNotification = (title: string, body: string) => {
  const options = {
    title,
    body,
    silent: false,
  };
  const notification = new Notification(options);
  notification.show();
};

function createSpeakingDifference(dueDate) {
  const today = dayjs();
  const daysUntilDue = dueDate.diff(today, 'day') + 1;

  if (dayjs(dueDate).isToday()) return 'Due today';
  if (dayjs(dueDate).isTomorrow()) return 'Due tomorrow';
  if (daysUntilDue > 1) return `Due in ${daysUntilDue} days`;
  return null;
}

export function handleNotification(id: number, due: string | null, body: string, badgeCount: number) {
  const notificationAllowed = configStorage.get('notificationsAllowed');

  if (notificationAllowed) {
    const today = dayjs().startOf('day');
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const notificationThresholdDueDates = configStorage.get('notificationThresholdDueDates');
    const daysUntilDue = createSpeakingDifference(dueDate);

    if (dueDate.isAfter(today - 1) && dueDate.isBefore(today.add(notificationThresholdDueDates, 'day'))) {
      
      badgeCount.count += 1;

      if(!notifiedTodoObjects.has(id)) {
        sendNotification(daysUntilDue, body);
        notifiedTodoObjects.add(id);
      } 
    }
  }
}
