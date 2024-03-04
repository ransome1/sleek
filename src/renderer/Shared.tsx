import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(calendar);

const { store, ipcRenderer } = window.api;

export const handleFilterSelect = (key: string, name: string, values: string | string[] | null, filters: Filters | null, exclude: boolean) => {
  try {

    const updatedFilters: Filters = { ...filters };
    const filterList: Filter[] = updatedFilters[key] || [];

    const filterIndex = filterList.findIndex((filter: Filter) => {
      return Array.isArray(values) && Array.isArray(filter.values) ? 
        values.every(v => filter.values.includes(v)) : 
        filter.values === values;
    });

    if (filterIndex !== -1) {
      filterList.splice(filterIndex, 1);
    } else {
      filterList.push({ name, values, exclude });
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

export const friendlyDate = (value: string, language: string, t: typeof i18n.t) => {
  const today = dayjs();
  const date = dayjs(value);
  const results = [];
  dayjs.locale(language)

  if (date.isSame(today, 'day')) {
    results.push(t('drawer.attributes.today'));
  }

  if (date.isSame(today.add(1, 'day'), 'day')) {
    results.push(t('drawer.attributes.tomorrow'));
  }

  if (date.isSame(today.subtract(1, 'day'), 'day')) {
    results.push(t('drawer.attributes.yesterday'));
  }

  if (date.isSame(today, 'week')) {
    results.push(t('drawer.attributes.thisWeek'));
  }

  if (date.isSame(today.add(1, 'week'), 'week')) {
    results.push(t('drawer.attributes.nextWeek'));
  }

  if (date.isBefore(today.endOf('month')) && date.isAfter(today, 'day')) {
    results.push(t('drawer.attributes.thisMonth'));
  }

  if (date.isBefore(today, 'month') && date.isAfter(today.subtract(1, 'week'), 'day')) {
    results.push(t('drawer.attributes.lastWeek'));
  }

  if (date.isBefore(today.add(1, 'month').startOf('month')) && date.isAfter(today.endOf('month'), 'day')) {
    results.push(t('drawer.attributes.nextMonth'));
  }

  if (results.length === 0) {
    results.push(dayjs(value).fromNow())
  }

  return results;
};

// export const friendlyDate = (value: string, t: typeof i18n.t) => {
//   const today = dayjs();
//   const date = dayjs(value);

//   if (date.isSame(today, 'day')) {
//     return `${t('drawer.attributes.today')}`;
//   } else if (date.isSame(today.add(1, 'day'), 'day')) {
//     return `${t('drawer.attributes.tomorrow')}`;
//   } else if (date.isSame(today.subtract(1, 'day'), 'day')) {
//     return `${t('drawer.attributes.yesterday')}`;
//   } else if (date.isSame(today, 'week')) {
//     return `${t('drawer.attributes.thisWeek')}`;
//   } else if (date.isSame(today.add(1, 'week'), 'week')) {
//     return `${t('drawer.attributes.nextWeek')}`;
//   } else if (date.isBefore(today.endOf('month')) && date.isAfter(today, 'day')) {
//     return `${t('drawer.attributes.thisMonth')}`;
//   } else if (date.isBefore(today, 'month') && date.isAfter(today.subtract(1, 'week'), 'day')) {
//     return `${t('drawer.attributes.lastWeek')}`;
//   } else if (date.isBefore(today.add(1, 'month'), 'month') && date.isAfter(today, 'day')) {
//     return `${t('drawer.attributes.nextMonth')}`;
//   } else {
//     return dayjs(value).fromNow();
//   }
// };