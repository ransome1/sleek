import dayjs from 'dayjs'
import { config } from '../config'

export function mustNotify(date: Date): boolean {
  const today = dayjs().startOf('day')
  const notificationThreshold: number = config.get('notificationThreshold')
  return dayjs(date).isBefore(today.add(notificationThreshold, 'day')) || false
}