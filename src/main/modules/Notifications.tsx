import crypto from 'crypto';
import { Notification } from 'electron';
import { config, filter, notifiedTodoObjectsStorage } from '../config';
import { checkForSearchMatches } from './ProcessDataRequest/ProcessTodoObjects';
import dayjs, { Dayjs } from "dayjs";
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isBetween);


function sendNotification(title: string, body: string) {
  const options = {
    title,
    body,
    silent: false,
  };
  const notification = new Notification(options);
  notification.show();
}

function createSpeakingDifference(dueDate: Dayjs) {
  const today = dayjs();
  const daysUntilDue: number = dueDate.diff(today, 'day') + 1;
  if(dayjs(dueDate).isToday()) return 'Due today';
  if(dayjs(dueDate).isTomorrow()) return 'Due tomorrow';
  if(daysUntilDue > 1) return `Due in ${daysUntilDue} days`;
  return 'Due';
}

function isNotificationSuppressed(searchFilters, body) {
  let suppressNotification = false;
  for (const searchFilter of searchFilters) {
    if (searchFilter.label && searchFilter.suppress) {
      const match = checkForSearchMatches(body, searchFilter.label);
      if (match) {
        suppressNotification = true;
        break;
      }
    }
  }
  return suppressNotification;
}

function handleNotification(due: string | null, body: string, badge: Badge) {
  const notificationAllowed = config.get('notificationsAllowed');
  
  if(notificationAllowed) {
    const today = dayjs().startOf('day');
    const todayString = today.format('YYYY-MM-DD');
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const notificationThreshold: number = config.get('notificationThreshold');
    const hash = todayString + crypto.createHash('sha256').update(body).digest('hex');
    const searchFilters: SearchFilter[] = filter.get('search') || [];

    if(isNotificationSuppressed(searchFilters, body)) return;
        
    if(dueDate.isToday() || dueDate.isBetween(today, today.add(notificationThreshold, 'day'))) {
      badge.count += 1;
      const title = createSpeakingDifference(dueDate);
      const notifiedTodoObjects = new Set<string>(notifiedTodoObjectsStorage.get('notifiedTodoObjects', []));
      if(!notifiedTodoObjects.has(hash)) {
        sendNotification(title, body);
        notifiedTodoObjects.add(hash);
        notifiedTodoObjectsStorage.set('notifiedTodoObjects', Array.from(notifiedTodoObjects));
      }
    }
  }
}

export { sendNotification, handleNotification }
