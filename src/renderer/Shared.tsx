import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import calendar from "dayjs/plugin/calendar";
import weekday from "dayjs/plugin/weekday";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(calendar);
dayjs.extend(weekday);
dayjs.extend(updateLocale);

const { store, ipcRenderer } = window.api;

interface Filter {
  value: string;
  exclude: boolean;
}

interface Settings {
  language: string;
  weekStart: number;
}

export function IsSelected(key, filters, value) {
  if (filters[key]) {
    for (let i = 0; i < filters[key].length; i++) {
      if (JSON.stringify(filters[key][i].value) === JSON.stringify(value)) {
        return true;
      }
    }
  }
  return false;
}

export function IsExcluded(attribute, filters) {
  const attributeValues = attribute.value;

  for (const filterList of Object.values(filters)) {
    for (const filter of filterList) {
      const filterValues = filter.value;
      const exclude = filter.exclude;

      if (
        filterValues.some((value) => attributeValues.includes(value)) &&
        exclude
      ) {
        return true;
      }
    }
  }
  return false;
}

export const HandleFilterSelect = (
  key: string,
  value: string,
  filters: Filters[] | null,
  exclude: boolean,
  groupedName?: string,
): void => {
  try {
    const updatedFilters = filters;
    const filtersForKey = filters[key] || [];
    const matchIndex = filtersForKey.findIndex(
      (filter) => JSON.stringify(filter.value) === JSON.stringify(value),
    );

    if (matchIndex >= 0) {
      filtersForKey.splice(matchIndex, 1);
    } else {
      filtersForKey.push({
        value,
        exclude,
        groupedName,
      });
    }

    updatedFilters[key] = filtersForKey;

    if (updatedFilters[key].length === 0) {
      delete updatedFilters[key];
    }

    store.setFilters("attributes", updatedFilters);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
};

export const handleReset = (): void => {
  store.setFilters("attributes", {});
};

export const handleLinkClick = (event: MouseEvent, url: string): void => {
  event.preventDefault();
  event.stopPropagation();
  if (url) {
    ipcRenderer.send("openInBrowser", url);
  }
};

export const translatedAttributes = (
  t: typeof i18n.t,
): Record<string, string> => {
  return {
    t: t("shared.attributeMapping.t"),
    due: t("shared.attributeMapping.due"),
    projects: t("shared.attributeMapping.projects"),
    contexts: t("shared.attributeMapping.contexts"),
    priority: t("shared.attributeMapping.priority"),
    rec: t("shared.attributeMapping.rec"),
    pm: t("shared.attributeMapping.pm"),
    created: t("shared.attributeMapping.created"),
    completed: t("shared.attributeMapping.completed"),
  };
};

export const friendlyDate = (
  value: string,
  attributeKey: string,
  settings: Settings,
  t: typeof i18n.t,
): string[] => {
  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart,
  });

  const today = dayjs();
  const date = dayjs(value);
  const results: string[] = [];

  if (date.isBefore(today, "day")) {
    results.push(
      attributeKey === "due"
        ? t("drawer.attributes.overdue")
        : t("drawer.attributes.elapsed"),
    );
  }

  if (
    date.isAfter(
      today.subtract(1, "week").startOf("week").subtract(1, "day"),
    ) &&
    date.isBefore(today.subtract(1, "week").endOf("week"))
  ) {
    results.push(t("drawer.attributes.lastWeek"));
  }

  if (
    date.isBefore(today.endOf("month")) &&
    date.isAfter(today.subtract(1, "day"), "day")
  ) {
    results.push(t("drawer.attributes.thisMonth"));
  }

  if (date.isSame(today, "week")) {
    results.push(t("drawer.attributes.thisWeek"));
  }

  if (date.isSame(today.subtract(1, "day"), "day")) {
    results.push(t("drawer.attributes.yesterday"));
  }

  if (date.isSame(today, "day")) {
    results.push(t("drawer.attributes.today"));
  }

  if (date.isSame(today.add(1, "day"), "day")) {
    results.push(t("drawer.attributes.tomorrow"));
  }

  if (date.isSame(today.add(1, "week"), "week")) {
    results.push(t("drawer.attributes.nextWeek"));
  }

  if (date.month() === today.add(1, "month").month()) {
    results.push(t("drawer.attributes.nextMonth"));
  }

  if (date.isAfter(today.add(1, "month").endOf("month"))) {
    results.push(dayjs(date).format("YYYY-MM-DD"));
  }

  return results;
};
