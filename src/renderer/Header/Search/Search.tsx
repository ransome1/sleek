import React, { useState, useEffect, useCallback, memo } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import OptionComponent from './Option';
import InputComponent from './Input';
import { withTranslation, WithTranslation } from 'react-i18next';
import './Search.scss';

const { ipcRenderer, store } = window.api;

const handleAddNewFilter = (
  event: React.SyntheticEvent,
  value: string,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
) => {
  event.stopPropagation();
  event.preventDefault();
  const updatedFilters = [
    { label: value, suppress: false },
    ...searchFilters.filter(searchFilter => searchFilter.label !== value)
  ];
  setSearchFilters(updatedFilters);
};

const getOptionLabel = (option: string | SearchFilter) => {
  if (typeof option === 'string') {
    return option;
  } else {
    if (option.label) {
      return option.label;
    } else if (option.inputValue) {
      return option.inputValue;
    }
  }
};

interface SearchComponentProps extends WithTranslation {
  headers: HeadersObject | null;
  settings: Settings,
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  searchFieldRef: React.RefObject<HTMLInputElement>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  t: typeof i18n.t;
}

const SearchComponent: React.FC<SearchComponentProps> = memo(({
  headers,
  settings,
  searchString,
  setSearchString,
  searchFieldRef,
  setPromptItem,
  t,
}) => {

  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>(store.getFilters('search'));
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const filterOptions = (options: string | SearchFilter[], params) => {
    const filter = createFilterOptions<SearchFilter>();
    const filtered: SearchFilter[] = filter(options as SearchFilter[], params);
    const { inputValue } = params;
    const isExisting = filtered.some(filter => filter.label && filter.label.includes(inputValue));
    if (inputValue !== '' && !isExisting) {
      filtered.push({
        inputValue,
        title: `${t('search.filters.create')} <code>${inputValue}</code>`,
      });
    }
    return filtered;
  };  

  useEffect(() => {
    const handleSearch = () => {
      ipcRenderer.send('requestData', searchString);
    };
    const delayedSearch: NodeJS.Timeout = setTimeout(handleSearch, 200);
    return () => {
      clearTimeout(delayedSearch);
    };
  }, [searchString]);

  useEffect(() => {
    if(searchFilters) {
      ipcRenderer.send('storeSetFilters', 'search', searchFilters);
    }
  }, [searchFilters]);

  useEffect(() => {
    if(settings.isSearchOpen && searchFieldRef.current) {
      searchFieldRef?.current?.focus();
    }
  }, [settings.isSearchOpen, searchFieldRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isSearchFocused = document.activeElement === searchFieldRef.current;
    if(!isAutocompleteOpen && isSearchFocused && event.key === 'ArrowDown') {
      setIsAutocompleteOpen(true);
    } else if((event.metaKey || event.ctrlKey) && event.shiftKey && event.code === 'KeyF') {
      searchFieldRef?.current?.focus();
      setIsAutocompleteOpen(!isAutocompleteOpen);
    }
  }, [searchFieldRef, isAutocompleteOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      {settings.isSearchOpen && (
        <div id='search' className={settings.isSearchOpen ? 'active' : ''}>
          <Autocomplete
            freeSolo
            autoHighlight
            open={isAutocompleteOpen}
            inputValue={searchString}      
            options={searchFilters}
            onBlur={() => setIsAutocompleteOpen(false)}
            filterOptions={filterOptions}
            onInputChange={(_, value) => setSearchString(value)}
            getOptionLabel={getOptionLabel}
            onChange={(event, value: string | SearchFilter | null) => {
              setIsAutocompleteOpen(false)
              if (value && value.inputValue) {
                handleAddNewFilter(event, value.inputValue, searchFilters, setSearchFilters);
              }
            }}
            renderOption={(props, option) => (
              <OptionComponent
                option={option}
                setPromptItem={setPromptItem}
                searchFilters={searchFilters}
                setSearchFilters={setSearchFilters}
                isAutocompleteOpen={isAutocompleteOpen}
                setIsAutocompleteOpen={setIsAutocompleteOpen}
                {...props}
              />
            )}
            
            renderInput={(params) => (
              <InputComponent
                headers={headers}
                searchString={searchString}
                setSearchString={setSearchString}
                searchFilters={searchFilters}
                searchFieldRef={searchFieldRef}
                isAutocompleteOpen={isAutocompleteOpen}
                setIsAutocompleteOpen={setIsAutocompleteOpen}
                settings={settings}
                {...params}
              />
            )}
          />
        </div>
      )}
    </>
  );
});

export default withTranslation()(SearchComponent);