import crypto from "crypto";
import { DateTime } from "luxon";
import { Notification } from "electron";
import { SettingsStore, NotificationsStore, FiltersStore } from "./Stores";
import { checkForSearchMatches } from "./Filters/Search";
import { SearchFilter, Badge } from "@sleek-types";

// ─── Store accessors ────────────────────────────────────────────────────────

const getNotificationThreshold = (): number =>
  SettingsStore.get("notificationThreshold");

const getNotifiedHashes = (): string[] =>
  (NotificationsStore.get("notificationHashes") as string[]) || [];

const getSearchFilters = (): SearchFilter[] =>
  (FiltersStore.get("search") as SearchFilter[]) || [];

export const GetToday = (): DateTime => DateTime.now().startOf("day");

const getThresholdDay = (today: DateTime): DateTime =>
  today.plus({ days: getNotificationThreshold() });

export function MustNotify(dueDate: DateTime, thresholdDay: DateTime): boolean {
  return dueDate < thresholdDay;
}

export function CreateTitle(dueDate: DateTime, today: DateTime): string {
  const tomorrow: DateTime = today.plus({ days: 1 });
  const daysUntilDue: number = dueDate.diff(today, "days").toObject().days ?? 0;

  if (dueDate.hasSame(today, "day")) return "Due today";
  if (dueDate.hasSame(tomorrow, "day")) return "Due tomorrow";
  return daysUntilDue > 1 ? `Due in ${daysUntilDue} days` : "";
}

export function SuppressNotification(
  dueDate: DateTime,
  body: string,
  hash: string,
  today: DateTime,
  thresholdDay: DateTime,
): boolean {
  if (getNotifiedHashes().includes(hash)) return true;
  if (dueDate < today || dueDate >= thresholdDay) return true;

  return getSearchFilters().some(
    (filter: SearchFilter) =>
      filter.label &&
      filter.suppress &&
      checkForSearchMatches(body, filter.label),
  );
}

export function CountBadge(
  dueDate: DateTime,
  badge: Badge,
  thresholdDay: DateTime,
): void {
  if (dueDate < thresholdDay) badge.count++;
}

export function HandleNotification(
  due: string,
  body: string,
  badge: Badge,
): void {
  if (!due || !body) return;

  const today = GetToday();
  const thresholdDay = getThresholdDay(today);
  const dueDate = DateTime.fromISO(due);
  const hash = crypto.createHash("sha256").update(body).digest("hex");

  CountBadge(dueDate, badge, thresholdDay);

  if (SuppressNotification(dueDate, body, hash, today, thresholdDay)) return;

  const notification = new Notification({
    title: CreateTitle(dueDate, today),
    body,
    silent: false,
  });
  notification.show();

  const notificationHashes = getNotifiedHashes();
  notificationHashes.push(hash);
  NotificationsStore.set("notificationHashes", notificationHashes);
}
