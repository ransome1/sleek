import dayjs, { Dayjs } from 'dayjs'
import crypto from 'crypto'
import { Notification } from 'electron'
import { SettingsStore } from './Stores/SettingsStore'
import { NotificationsStore } from './Stores/NotificationsStore'
import { FiltersStore } from './Stores/FiltersStore'
import { checkForSearchMatches } from './Filters/Search'
import isToday from 'dayjs/plugin/isToday.js'
import isTomorrow from 'dayjs/plugin/isTomorrow.js'
dayjs.extend(isToday)
dayjs.extend(isTomorrow)

interface SearchFilter {
  label: string;
  suppress: boolean;
}

export function MustNotify(date: Dayjs): boolean {
  const today: Dayjs = dayjs().startOf('day')
  const notificationThreshold: number = SettingsStore.get('notificationThreshold')
  return dayjs(date).isBefore(today.add(notificationThreshold, 'day')) || false
}

export function CreateTitle(dueDate: Dayjs, today: Dayjs): string {
  const daysUntilDue: number = dueDate.diff(today, 'day') + 1
  if (dueDate.isToday()) return 'Due today'
  if (dueDate.isTomorrow()) return 'Due tomorrow'
  if (daysUntilDue > 1) return `Due in ${daysUntilDue} days`
}

export function SuppressNotification(dueDate: Dayjs, today: Dayjs, body: string, notifiedTodoObjects: string[], hash: string, notificationThreshold: number): boolean {

  if (notifiedTodoObjects.includes(hash)) return true

  if (dueDate.isBefore(today)) return true

  if (dueDate.isAfter(today.add(notificationThreshold, 'day'))) return true

  const searchFilters: SearchFilter[] = FiltersStore.get('search') || []
  for (const searchFilter of searchFilters) {
    
    if (searchFilter.label && searchFilter.suppress) {
      const match: boolean = checkForSearchMatches(body, searchFilter.label)
      return match
    }
  }
  return false
}

export function CountBadge(dueDate: Dayjs, today: Dayjs, notificationThreshold: number, badge: Badge): void {
  if (dueDate.isBefore(today.add(notificationThreshold, 'day'))) {
    badge.count += 1
  }
}

export function HandleNotification(dueDate: Dayjs, body: string, badge: Badge): void {
  const today: Dayjs = dayjs().startOf('day')
  const hash: string = crypto.createHash('sha256').update(body).digest('hex')
  const notifiedTodoObjects = NotificationsStore.get('notifiedTodoObjects') || []
  const notificationThreshold: number = SettingsStore.get('notificationThreshold')

  CountBadge(dueDate, today, notificationThreshold, badge);

  if (SuppressNotification(dueDate, today, body, notifiedTodoObjects, hash, notificationThreshold)) return false;

  const notification = new Notification({
    title: CreateTitle(dueDate, today),
    body,
    silent: false
  })
  notification.show()

  notifiedTodoObjects.push(hash)
  NotificationsStore.set('notifiedTodoObjects', notifiedTodoObjects)
}