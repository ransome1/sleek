import crypto from 'crypto';
import { DateTime } from "luxon";
import { Notification } from 'electron';
import { SettingsStore, NotificationsStore, FiltersStore } from './Stores';
import { checkForSearchMatches } from './Filters/Search';
import { SearchFilter, Badge } from '../Types'

export const GetToday = (): DateTime => {
  const now = DateTime.now();
  return now.startOf('day');
}
const GetThresholdDay = (): DateTime => {
  const today = GetToday();
  const notificationThreshold = GetNotificationThreshold();
  return today.plus({ days: notificationThreshold });
}
const GetNotificationThreshold = (): number => SettingsStore.get('notificationThreshold');
const GetNotifiedTodoObjects = (): string[] => NotificationsStore.get('notificationHashes') || [];
const GetSearchFilters = (): SearchFilter[] => FiltersStore.get('search') || [];

export function MustNotify(date): boolean {
  const today = GetToday();
  const thresholdDay = GetThresholdDay();
  return date < thresholdDay
}

export function CreateTitle(dueDate): string {
  const today: DateTime = GetToday();
  const tomorrow: DateTime = today.plus({ days: 1 });
  const daysUntilDue: DateTime = dueDate.diff(today, 'days').toObject().days;
  const thresholdDay = GetThresholdDay();

  if(dueDate.hasSame(today, 'day')) return 'Due today';
  if(dueDate.hasSame(tomorrow, 'day')) return 'Due tomorrow';
  return daysUntilDue > 1 ? `Due in ${daysUntilDue} days` : '';
}

export function SuppressNotification(dueDate, body: string, hash: string): boolean {
  const notificationHashes: string[] = GetNotifiedTodoObjects();
  if (notificationHashes.includes(hash)) return true;
  
  const today: DateTime = GetToday();
  const thresholdDay = GetThresholdDay();
  if (dueDate < today || dueDate >= thresholdDay) return true;

  const searchFilters = GetSearchFilters();
  return searchFilters.some(filter => filter.label && filter.suppress && checkForSearchMatches(body, filter.label));
}

export function CountBadge(dueDate, badge: Badge): void {
  const thresholdDay = GetThresholdDay();
  if (dueDate < thresholdDay) badge.count++
}

export function HandleNotification(due: string, body: string, badge: Badge): void {
  if (!due || !body) return;
  const hash = crypto.createHash('sha256').update(body).digest('hex');

  const dueDate = DateTime.fromISO(due);

  CountBadge(dueDate, badge);

  if (SuppressNotification(dueDate, body, hash)) return;

  const notification = new Notification({
    title: CreateTitle(dueDate),
    body,
    silent: false,
  });
  notification.show();

  const notificationHashes = GetNotifiedTodoObjects();
  notificationHashes.push(hash);
  NotificationsStore.set('notificationHashes', notificationHashes);
}