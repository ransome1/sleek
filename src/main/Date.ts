import Sugar from "sugar";
import { DateTime } from "luxon";
import { MustNotify, GetToday } from "./Notifications";
import { SettingsStore } from "./Stores";

export function replaceSpeakingDatesWithAbsoluteDates(string: string): string {
  const speakingDates: DateAttributes = extractSpeakingDates(string);
  const due: DateAttribute = speakingDates["due:"];
  const t: DateAttribute = speakingDates["t:"];
  if (due.date) {
    string = string.replace(`due:${due.string!}`, `due:${due.date}`);
  }
  if (t.date) {
    string = string.replace(t.string!, t.date);
  }
  return string;
}

function processDateWithSugar(
  string: string,
  type: string,
): DateAttribute | null {
  const words = string.split(" ");
  let combinedValue = "";
  let lastMatch: DateAttribute | null = null;

  for (let index = 0; index < words.length; index++) {
    if (words[index]) combinedValue += words[index] + " ";

    const sugarDate = Sugar.Date.create(combinedValue, { future: true });

    if (!Sugar.Date.isValid(sugarDate)) continue;

    if (type === "absolute" || type === "relative") {
      const isoDate = Sugar.Date(sugarDate).format("%F").raw;
      const today = GetToday();
      const thresholdDay = today.plus({
        days: SettingsStore.get("notificationThreshold") as number,
      });
      lastMatch = {
        date: isoDate,
        string: combinedValue.slice(0, -1),
        type: type,
        notify: MustNotify(DateTime.fromJSDate(sugarDate), thresholdDay),
      };
    }
  }
  return lastMatch;
}

type DateType = "relative" | "absolute";

export interface DateAttribute {
  date: string | null;
  string: string | null;
  type: DateType | null;
  notify: boolean;
}

export interface DateAttributes {
  "due:": DateAttribute;
  "t:": DateAttribute;
}

export function extractSpeakingDates(body: string): DateAttributes {
  const expressions = [
    {
      pattern: /(?<=\b)due:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=[^\s]:|$)/g,
      key: "due:",
      type: "relative" as DateType,
    },
    {
      pattern: /(?<=\b)due:(\d{4}-\d{2}-\d{2})/g,
      key: "due:",
      type: "absolute" as DateType,
    },
    {
      pattern: /(?<=\b)t:(?!(\d{4}-\d{2}-\d{2}))(.*?)(?=[^\s]:|$)/g,
      key: "t:",
      type: "relative" as DateType,
    },
    {
      pattern: /(?<=\b)t:(\d{4}-\d{2}-\d{2})/g,
      key: "t:",
      type: "absolute" as DateType,
    },
  ];

  const speakingDates: DateAttributes = {
    "due:": {
      date: null,
      string: null,
      type: null,
      notify: false,
    },
    "t:": {
      date: null,
      string: null,
      type: null,
      notify: false,
    },
  };

  for (const expression of expressions) {
    const regex = new RegExp(`(${expression.pattern.source})`);
    const match = body.match(regex);
    if (match) {
      const attributeValue = match[0].slice(expression.key.length);
      const dateAttribute = processDateWithSugar(
        attributeValue,
        expression.type,
      );
      speakingDates[expression.key] =
        dateAttribute || speakingDates[expression.key];
    }
  }

  return speakingDates;
}
