import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';
import { i18n } from './Settings/LanguageSelector';
import { friendlyDateGroup } from 'main/modules/Date';
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

  const date = dayjs(value);
  const group = friendlyDateGroup(date);

  const results = [];

  switch (group) {
    case null:
      // This should never happen, as `date` will always be a valid date
      break;
    case 'before-last-week':
      results.push((attributeKey === 'due') ? t('drawer.attributes.overdue') : t('drawer.attributes.elapsed'));
      break;
    case 'last-week':
      results.push((attributeKey === 'due') ? t('drawer.attributes.overdue') : t('drawer.attributes.elapsed'));
      results.push(t('drawer.attributes.lastWeek'));
      break;
    case 'yesterday':
      results.push((attributeKey === 'due') ? t('drawer.attributes.overdue') : t('drawer.attributes.elapsed'));
      results.push(t('drawer.attributes.yesterday'));
      break;
    case 'today':
      results.push(t('drawer.attributes.today'));
      break;
    case 'tomorrow':
      results.push(t('drawer.attributes.tomorrow'));
      break;
    case 'this-week':
      results.push(t('drawer.attributes.thisWeek'));
      break;
    case 'next-week':
      results.push(t('drawer.attributes.nextWeek'));
      break;
    case 'this-month':
      results.push(t('drawer.attributes.thisMonth'));
      break;
    case 'next-month':
      results.push(t('drawer.attributes.nextMonth'));
      break;
    case 'after-next-month':
      results.push(dayjs(date).format('YYYY-MM-DD'));
      break;
  }

  return results;
};
