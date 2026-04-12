import { app } from "electron";
import { Item } from "jstodotxt";
import { SettingsStore } from "../Stores";
import { HandleNotification } from "../Notifications";
import {
  extractSpeakingDates,
  replaceSpeakingDatesWithAbsoluteDates,
} from "../Date";
import { lineBreakPlaceholder } from "../Shared";
import { DateTime } from "luxon";

let linesInFile: string[];
const badge: Badge = { count: 0 };

function createTodoObject(
  lineNumber: number,
  string: string,
  attributeType?: string,
  attributeValue?: string,
): TodoObject {
  // eslint-disable-next-line no-control-regex
  let content = string.replaceAll(/[\x10\r\n]/g, " [LB] ");

  // When setting an extension, first replace any speaking dates with absolute dates
  // to prevent jstodotxt from mishandling the date replacement
  if (attributeType && (attributeType === "due" || attributeType === "t")) {
    content = replaceSpeakingDatesWithAbsoluteDates(content);
  }

  const JsTodoTxtObject = new Item(content);

  const extensions = JsTodoTxtObject.extensions();

  if (attributeType) {
    if (attributeType === "priority") {
      const value = attributeValue === "-" ? null : attributeValue;
      JsTodoTxtObject.setPriority(value);
    } else {
      if (!attributeValue) {
        JsTodoTxtObject.removeExtension(attributeType);
      } else {
        JsTodoTxtObject.setExtension(attributeType, attributeValue);
      }
    }
  }

  content = JsTodoTxtObject.toString().replaceAll(
    " [LB] ",
    lineBreakPlaceholder,
  );

  const body = JsTodoTxtObject.body().replaceAll(" [LB] ", " ");
  const speakingDates: DateAttributes = extractSpeakingDates(body);
  const due = speakingDates["due:"]?.date || null;
  const dueString = speakingDates["due:"]?.string || null;
  const notify = speakingDates["due:"]?.notify || false;
  const t = speakingDates["t:"]?.date || null;
  const tString = speakingDates["t:"]?.string || null;
  const hidden = extensions.some(
    (extension) => extension.key === "h" && extension.value === "1",
  );
  const pm: string | number | null =
    extensions.find((extension) => extension.key === "pm")?.value || null;
  const rec =
    extensions.find((extension) => extension.key === "rec")?.value || null;
  const createdRaw = JsTodoTxtObject.created();
  const created =
    createdRaw && DateTime.fromJSDate(createdRaw).isValid
      ? DateTime.fromJSDate(createdRaw).toFormat("yyyy-MM-dd")
      : null;
  const completedRaw = JsTodoTxtObject.completed();
  const completed =
    completedRaw && DateTime.fromJSDate(completedRaw).isValid
      ? DateTime.fromJSDate(completedRaw).toFormat("yyyy-MM-dd")
      : null;
  const projects =
    JsTodoTxtObject.projects().length > 0 ? JsTodoTxtObject.projects() : null;
  const contexts =
    JsTodoTxtObject.contexts().length > 0 ? JsTodoTxtObject.contexts() : null;
  const pri: string | number | null =
    extensions.find((extension) => extension.key === "pri")?.value || null;
  const existingPriority = JsTodoTxtObject.priority();
  const priority =
    existingPriority !== null && existingPriority !== undefined
      ? existingPriority
      : pri;

  return {
    lineNumber,
    body,
    created,
    complete: JsTodoTxtObject.complete(),
    completed: completed,
    priority,
    contexts: contexts,
    projects: projects,
    due,
    dueString,
    notify,
    t,
    tString,
    rec,
    hidden,
    pm,
    string: content,
  };
}

function createTodoObjects(fileContent: string | null): TodoObject[] | [] {
  if (!fileContent) {
    linesInFile = [];
    return [];
  }
  badge.count = 0;
  linesInFile = fileContent
    .split(/[\r\n]+/)
    .filter((line) => line.trim() !== "");

  // todo: might causes problems due to index offset created by it
  const excludeLinesWithPrefix: string[] =
    SettingsStore.get("excludeLinesWithPrefix") || [];

  const todoObjects: TodoObject[] = linesInFile
    .map((line, index) => {
      if (excludeLinesWithPrefix.some((prefix) => line.startsWith(prefix))) {
        return null;
      }

      const todoObject: TodoObject = createTodoObject(index, line);

      if (
        SettingsStore.get("notificationsAllowed") &&
        todoObject.body &&
        todoObject.due &&
        !todoObject.complete
      ) {
        HandleNotification(todoObject.due, todoObject.body, badge);
      }

      return todoObject;
    })
    .filter(Boolean) as TodoObject[];

  app.setBadgeCount(badge.count);

  return todoObjects;
}

export { createTodoObjects, createTodoObject, linesInFile };
