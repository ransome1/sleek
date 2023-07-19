const ipcRenderer = window.electron.ipcRenderer;

export function handleFilterSelect(key: string, value: string, filters: object, isCtrlKeyPressed: boolean): void {
  const updatedFilters = { ...filters };
  if (updatedFilters[key]) {
    const filterIndex = updatedFilters[key].findIndex((filter: { value: string }) => filter.value === value);
    if (filterIndex !== -1) {
      updatedFilters[key].splice(filterIndex, 1);
    } else {
      updatedFilters[key].push({ value: value, exclude: isCtrlKeyPressed });
    }
  } else {
    updatedFilters[key] = [{ value: value, exclude: isCtrlKeyPressed }];
  }
  ipcRenderer.send('requestData', '', updatedFilters);
}
