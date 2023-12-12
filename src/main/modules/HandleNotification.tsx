import crypto from 'crypto';
import { Notification } from 'electron';
import { configStorage, notifiedTodoObjectsStorage } from '../config';
import { Badge } from '../util';
import dayjs, { Dayjs } from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isBetween);

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
  let result;
  const notificationAllowed = configStorage.get('notificationsAllowed');
  const today = dayjs().startOf('day').format('YYYY-MM-DD');
  const hash = today + crypto.createHash('sha256').update(body).digest('hex');
  if (notificationAllowed) {
    const today = dayjs().startOf('day');
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const notificationThreshold: number = configStorage.get('notificationThreshold');
    const daysUntilDue: any = createSpeakingDifference(dueDate);
    if (dueDate.isToday() || dueDate.isBetween(today, today.add(notificationThreshold, 'day'))) {
      badge.count += 1;
      const notifiedTodoObjects = new Set<string>(notifiedTodoObjectsStorage.get('notifiedTodoObjects', []));
      if (!notifiedTodoObjects.has(hash)) {
        result = sendNotification(daysUntilDue, body);
        notifiedTodoObjects.add(hash);
        notifiedTodoObjectsStorage.set('notifiedTodoObjects', Array.from(notifiedTodoObjects));
      }
    }
  }
}