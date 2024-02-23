const { store, ipcRenderer } = window.api;

export const handleFilterSelect = (key: string, value: string | string[] | null, filters: Filters | null, isCtrlKeyPressed: boolean) => {
  try {
    const updatedFilters: Filters = { ...filters };
    const filterList: Filter[] = updatedFilters[key] || [];

    if(typeof value === 'string') {
      const values = value.split(',');
      values.forEach((singleValue) => {
        const filterIndex: number = filterList.findIndex((filter) => filter.value === singleValue);
        if(filterIndex !== -1) {
          filterList.splice(filterIndex, 1);
          if(isCtrlKeyPressed) {
            filterList.push({ value: singleValue, exclude: true });
          }
        } else {
          filterList.push({ value: singleValue, exclude: isCtrlKeyPressed });
        }
      });
    } else {
      const filterIndex = filterList.findIndex((filter: Filter) => filter.value === value);
      if(filterIndex !== -1) {
        filterList.splice(filterIndex, 1);
        if(isCtrlKeyPressed) {
          filterList.push({ value, exclude: true });
        }
      } else {
        filterList.push({ value, exclude: isCtrlKeyPressed });
      }
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