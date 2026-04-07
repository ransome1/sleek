import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";

const { store, ipcRenderer } = window.api;

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
  LuxonSettings.defaultWeekSettings = {
    firstDay: (settings.weekStart === 0
      ? 7
      : settings.weekStart) as WeekdayNumbers,
    minimalDays: 4,
    weekend: [6, 7],
  };

  const today = DateTime.now().startOf("day");
  const date = DateTime.fromISO(value).startOf("day");
  const results: string[] = [];

  if (date < today) {
    results.push(
      attributeKey === "due"
        ? t("drawer.attributes.overdue")
        : t("drawer.attributes.elapsed"),
    );
  }

  if (
    date >=
      today.minus({ weeks: 1 }).startOf("week", { useLocaleWeeks: true }) &&
    date <= today.minus({ weeks: 1 }).endOf("week", { useLocaleWeeks: true })
  ) {
    results.push(t("drawer.attributes.lastWeek"));
  }

  if (date <= today.endOf("month") && date > today.minus({ days: 1 })) {
    results.push(t("drawer.attributes.thisMonth"));
  }

  if (
    date >= today.startOf("week", { useLocaleWeeks: true }) &&
    date <= today.endOf("week", { useLocaleWeeks: true })
  ) {
    results.push(t("drawer.attributes.thisWeek"));
  }

  if (date.hasSame(today.minus({ days: 1 }), "day")) {
    results.push(t("drawer.attributes.yesterday"));
  }

  if (date.hasSame(today, "day")) {
    results.push(t("drawer.attributes.today"));
  }

  if (date.hasSame(today.plus({ days: 1 }), "day")) {
    results.push(t("drawer.attributes.tomorrow"));
  }

  if (
    date >=
      today.plus({ weeks: 1 }).startOf("week", { useLocaleWeeks: true }) &&
    date <= today.plus({ weeks: 1 }).endOf("week", { useLocaleWeeks: true })
  ) {
    results.push(t("drawer.attributes.nextWeek"));
  }

  if (date.month === today.plus({ months: 1 }).month) {
    results.push(t("drawer.attributes.nextMonth"));
  }

  if (date > today.plus({ months: 1 }).endOf("month")) {
    results.push(date.toFormat("yyyy-MM-dd"));
  }

  return results;
};
