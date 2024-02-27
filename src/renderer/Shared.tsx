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

export const friendlyDate = (value: string, t: typeof i18n.t) => {
  //dayjs.locale(language);
  return dayjs(value).calendar(null, {
    sameDay: `[${t(`drawer.attributes.today`)}]`,
    nextDay: `[${t(`drawer.attributes.tomorrow`)}]`,
    nextWeek: `[${t(`drawer.attributes.nextWeek`)}]`,
    lastDay: `[${t(`drawer.attributes.yesterday`)}]`,
    lastWeek: `[${t(`drawer.attributes.lastWeek`)}]`,
    sameElse: function () {
      return dayjs(this).fromNow();
    },
  });
};