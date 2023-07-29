import { Notification } from 'electron';
import dayjs from 'dayjs';

export const notifiedTodoObjects: Set<number> = new Set();

export const sendNotification = (title: string, body: string) => {
  const options: object = {
    title: title,
    body: body,
    silent: false,
  };

  const notification = new Notification(options);
  notification.show();
}

export function handleNotification(id: number, due: string | null, body: string) {
  if (due && !notifiedTodoObjects.has(id)) {
    const dueDate = dayjs(due, 'YYYY-MM-DD');
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().add(1, 'day').startOf('day');

    if (dueDate.isSame(today, 'day')) {
      sendNotification('Due today', body);
      notifiedTodoObjects.add(id);
    } else if (dueDate.isSame(tomorrow, 'day')) {
      sendNotification('Due tomorrow', body);
      notifiedTodoObjects.add(id);
    }
  }
}