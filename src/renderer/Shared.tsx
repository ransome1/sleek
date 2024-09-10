import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';
import { i18n } from './Settings/LanguageSelector';
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(calendar);
dayjs.extend(weekday);
dayjs.extend(updateLocale);

const { store, ipcRenderer } = window.api;

export const handleFilterSelect = (key: string, name: string, values: string | string[] | null, filters: Filters | null, exclude: boolean) => {
  try {

    const updatedFilters: Filters = { ...filters };
    const filterList: Filter[] = updatedFilters[key] || [];

    const normalizedValues = typeof values === 'string' ? [values] : values;

    const filterIndex = filterList.findIndex((filter: Filter) => {
      return Array.isArray(normalizedValues) && Array.isArray(filter.values) ? 
        normalizedValues.every(v => filter.values.includes(v)) : 
        filter.values === normalizedValues;
    });

    if (filterIndex !== -1) {
      filterList.splice(filterIndex, 1);
    } else {
      filterList.push({ name, values: normalizedValues, exclude });
    }

    updatedFilters[key] = filterList;
    store.setFilters('attributes', updatedFilters);
  } catch (error: any) {
    console.error(error);
  }
};


export const handleLinkClick = (event: MouseEvent, url: string) => {
  event.preventDefault();
  event.stopPropagation();
  if(url) {
    ipcRenderer.send('openInBrowser', url)
  }
};

export const translatedAttributes = (t: typeof i18n.t) => {
  return {
    t: t('shared.attributeMapping.t'),
    due: t('shared.attributeMapping.due'),
    projects: t('shared.attributeMapping.projects'),
    contexts: t('shared.attributeMapping.contexts'),
    priority: t('shared.attributeMapping.priority'),
    rec: t('shared.attributeMapping.rec'),
    pm: t('shared.attributeMapping.pm'),
    created: t('shared.attributeMapping.created'),
    completed: t('shared.attributeMapping.completed'),
  }
};

export const friendlyDate = (value: string, attributeKey: string, settings: Settings, t: typeof i18n.t) => {
  dayjs.updateLocale(settings.language, {
    weekStart: settings.weekStart,
  });

  const today = dayjs();
  const date = dayjs(value);
  const results = [];

  if (date.isBefore(today, 'day')) {
    results.push((attributeKey === 'due') ? t('drawer.attributes.overdue') : t('drawer.attributes.elapsed'));
  }  

  if (date.isAfter(today.subtract(1, 'week').startOf('week').subtract(1, 'day')) && date.isBefore(today.subtract(1, 'week').endOf('week'))) {
    results.push(t('drawer.attributes.lastWeek'));
  }

  if (date.isBefore(today.endOf('month')) && date.isAfter(today.subtract(1, 'day'), 'day')) {
    results.push(t('drawer.attributes.thisMonth'));
  }

  if (date.isSame(today, 'week')) {
    results.push(t('drawer.attributes.thisWeek'));
  }  

  if (date.isSame(today.subtract(1, 'day'), 'day')) {
    results.push(t('drawer.attributes.yesterday'));
  }

  if (date.isSame(today, 'day')) {
    results.push(t('drawer.attributes.today'));
  }

  if (date.isSame(today.add(1, 'day'), 'day')) {
    results.push(t('drawer.attributes.tomorrow'));
  }

  if (date.isSame(today.add(1, 'week'), 'week')) {
    results.push(t('drawer.attributes.nextWeek'));
  }

  if (date.month() === today.add(1, 'month').month()) {
    results.push(t('drawer.attributes.nextMonth'));
  }

  if (date.isAfter(today.add(1, 'month').endOf('month'))) {
    results.push(dayjs(date).format('YYYY-MM-DD'));
  }

  return results;
};
