import { i18n } from './LanguageSelector';

const { ipcRenderer, store } = window.api;

const handleFilterSelect = (key: string, value: string | string[], filters: Record<string, any>, isCtrlKeyPressed: boolean) => {
  try {
    const updatedFilters = { ...filters };
    const filterList = updatedFilters[key] || [];

    if (typeof value === 'string') {
      const values = value.split(',');
      values.forEach((singleValue) => {
        const filterIndex = filterList.findIndex((filter) => filter.value === singleValue);
        if (filterIndex !== -1) {
          filterList.splice(filterIndex, 1);
          if (isCtrlKeyPressed) {
            filterList.push({ value: singleValue, exclude: true });
          }
        } else {
          filterList.push({ value: singleValue, exclude: isCtrlKeyPressed });
        }
      });
    } else {
      const filterIndex = filterList.findIndex((filter) => filter.value === value);
      if (filterIndex !== -1) {
        filterList.splice(filterIndex, 1);
        if (isCtrlKeyPressed) {
          filterList.push({ value, exclude: true });
        }
      } else {
        filterList.push({ value, exclude: isCtrlKeyPressed });
      }
    }
    updatedFilters[key] = filterList;
    store.setFilters(updatedFilters);
    ipcRenderer.send('requestData');
  } catch (error) {
    console.error(error);
  }
};

const attributeMapping = {
  t: i18n.t('shared.attributeMapping.t'),
  due: i18n.t('shared.attributeMapping.due'),
  projects: i18n.t('shared.attributeMapping.projects'),
  contexts: i18n.t('shared.attributeMapping.contexts'),
  priority: i18n.t('shared.attributeMapping.priority'),
  rec: i18n.t('shared.attributeMapping.rec'),
  pm: i18n.t('shared.attributeMapping.pm'),
  created: i18n.t('shared.attributeMapping.created'),
  completed: i18n.t('shared.attributeMapping.completed'),
};

const handleSettingChange = (name: keyof typeof settings, setSettings: React.Dispatch<React.SetStateAction<any>>) => (event: React.ChangeEvent<any>) => {
  try {
    if (typeof event.target.checked === 'boolean') {
      const checked = event.target.checked;
      store.set(name, checked);
      setSettings((prevSettings) => ({
        ...prevSettings,
        [name]: checked,
      }));
    } else if (typeof event.target.value === 'string') {
      const value = event.target.value as string;
      store.set(name, value);
      setSettings((prevSettings) => ({
        ...prevSettings,
        [name]: value,
      }));
    }
  } catch (error) {
    console.error(error);
  }
};

export { handleFilterSelect, attributeMapping, handleSettingChange };