import { Notification } from 'electron';
import { configStorage } from '../config';
import { Badge } from '../util';
import dayjs, { Dayjs } from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
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

function createSpeakingDifference(dueDate: Dayjs) {
  const today = dayjs();
  const daysUntilDue: number = dueDate.diff(today, 'day') + 1;

  if (dayjs(dueDate).isToday()) return 'Due today';
  if (dayjs(dueDate).isTomorrow()) return 'Due tomorrow';
  if (daysUntilDue > 1) return `Due in ${daysUntilDue} days`;
  return 'Due';
}

export function handleNotification(id: number, due: string | null, body: string, badge: Badge) {
  const notificationAllowed = configStorage.get('notificationsAllowed');

  if (notificationAllowed) {
    const today = dayjs().startOf('day');
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const notificationThreshold: number = configStorage.get('notificationThreshold');
    const daysUntilDue: any = createSpeakingDifference(dueDate);

    if (dueDate.isAfter(today.subtract(1, 'day')) && dueDate.isBefore(today.add(notificationThreshold, 'day'))) {
      badge.count += 1;

      if (!notifiedTodoObjects.has(id)) {
        sendNotification(daysUntilDue, body);
        notifiedTodoObjects.add(id);
      }
    }
  }
}