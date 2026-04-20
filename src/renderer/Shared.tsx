import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";
import { Filter, Filters, AttributeKey, SettingStore } from "@sleek-types";
import { i18n } from "./Settings/LanguageSelector";

const { store, ipcRenderer } = window.api;

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

export function IsExcluded(attribute, filters: Filters | null) {
  if (!filters) return false;
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
  key: AttributeKey,
  value: string[],
  filters: Filters | null,
  exclude: boolean,
  groupedName: string | null,
): void => {
  try {
    const updatedFilters = filters || ({} as Filters);
    const filtersForKey =
      filters && filters[key] ? filters[key] : ([] as Filter[]);
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

export const handleLinkClick = (event: React.MouseEvent, url: string): void => {
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
  settings: SettingStore,
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

  // Calculate days difference (positive = future, negative = past)
  const daysDiff = date.diff(today, "days").days;

  // Past dates
  if (daysDiff < 0) {
    if (daysDiff === -1) {
      results.push(t("drawer.attributes.yesterday"));
    } else {
      results.push(
        attributeKey === "due"
          ? t("drawer.attributes.overdue")
          : t("drawer.attributes.elapsed"),
      );
    }
    return results;
  }

  // Today
  if (daysDiff === 0) {
    results.push(t("drawer.attributes.today"));
    return results;
  }

  // Tomorrow (1 day away)
  if (daysDiff === 1) {
    results.push(t("drawer.attributes.tomorrow"));
    return results;
  }

  // This week - remainder of current calendar week (based on weekStart)
  const endOfThisWeek = today.endOf("week", { useLocaleWeeks: true });

  if (date <= endOfThisWeek) {
    results.push(t("drawer.attributes.thisWeek"));
    return results;
  }

  // This month - rest of current month
  const endOfThisMonth = today.endOf("month");

  if (date <= endOfThisMonth) {
    results.push(t("drawer.attributes.thisMonth"));
    return results;
  }

  // Next month - dates in the following month
  const endOfNextMonth = today.plus({ months: 1 }).endOf("month");

  if (date <= endOfNextMonth) {
    results.push(t("drawer.attributes.nextMonth"));
    return results;
  }

  // Far future - use date format
  results.push(date.toFormat("yyyy-MM-dd"));
  return results;
};
