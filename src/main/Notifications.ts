import dayjs, { Dayjs } from 'dayjs';
import crypto from 'crypto';
import { Notification } from 'electron';
import { SettingsStore, NotificationsStore, FiltersStore } from './Stores';
import { checkForSearchMatches } from './Filters/Search';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);

interface SearchFilter {
  label: string;
  suppress: boolean;
}

interface Badge {
  count: number;
}

const getToday = (): Dayjs => dayjs().startOf('day');
const getNotificationThreshold = (): number => SettingsStore.get('notificationThreshold');
const getNotifiedTodoObjects = (): string[] => NotificationsStore.get('notificationHashes') || [];
const getSearchFilters = (): SearchFilter[] => FiltersStore.get('search') || [];

export function MustNotify(date: Dayjs): boolean {
  const today = getToday();
  const notificationThreshold = getNotificationThreshold();
  return date.isBefore(today.add(notificationThreshold, 'day'));
}

export function CreateTitle(dueDate: Dayjs): string {
  const today = getToday();
  const daysUntilDue = dueDate.diff(today, 'day');
  if (dueDate.isToday()) return 'Due today';
  if (dueDate.isTomorrow()) return 'Due tomorrow';
  return daysUntilDue > 1 ? `Due in ${daysUntilDue} days` : '';
}

export function SuppressNotification(dueDate: Dayjs, body: string, hash: string): boolean {
  const today = getToday();
  const notificationThreshold = getNotificationThreshold();
  const notificationHashes = getNotifiedTodoObjects();

  if (notificationHashes.includes(hash)) return true;
  if (dueDate.isBefore(today)) return true;
  if (dueDate.isAfter(today.add(notificationThreshold, 'day'))) return true;

  const searchFilters = getSearchFilters();
  return searchFilters.some(filter => filter.label && filter.suppress && checkForSearchMatches(body, filter.label));
}

export function CountBadge(dueDate: Dayjs, badge: Badge): void {
  const today = getToday();
  const notificationThreshold = getNotificationThreshold();
  if (dueDate.isBefore(today.add(notificationThreshold, 'day'))) badge.count++
}

export function HandleNotification(dueDate: Dayjs, body: string, badge: Badge): void {
  const today = getToday();
  const hash = crypto.createHash('sha256').update(body).digest('hex');

  CountBadge(dueDate, badge);

  if (SuppressNotification(dueDate, body, hash)) return;

  const notification = new Notification({
    title: CreateTitle(dueDate),
    body,
    silent: false,
  });
  notification.show();

  const notificationHashes = getNotifiedTodoObjects();
  notificationHashes.push(hash);
  NotificationsStore.set('notificationHashes', notificationHashes);
}