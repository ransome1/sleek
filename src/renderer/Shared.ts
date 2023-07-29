const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

export function handleFilterSelect(key, value, filters, isCtrlKeyPressed) {
  const updatedFilters = { ...filters };
  const filterList = updatedFilters[key] || [];

  const filterIndex = filterList.findIndex((filter) => filter.value === value);
  if (filterIndex !== -1) {
    filterList.splice(filterIndex, 1);
    if (isCtrlKeyPressed) {
      filterList.push({ value, exclude: true });
    }
  } else {
    filterList.push({ value, exclude: isCtrlKeyPressed });
  }

  updatedFilters[key] = filterList;
  store.setFilters(updatedFilters);
  ipcRenderer.send('requestData');
}
