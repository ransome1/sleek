const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

export function handleFilterSelect(key, value, filters, isCtrlKeyPressed) {
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
}

export const attributeMapping = {
  t: 'Threshold date',
  due: 'Due date',
  projects: 'Projects',
  contexts: 'Contexts',
  priority: 'Priority',
  rec: 'Recurrence',
  pm: 'Pomodoro timer',
  created: 'Creation date',
  completed: 'Completion date',
  //tags: 'Tags',
};