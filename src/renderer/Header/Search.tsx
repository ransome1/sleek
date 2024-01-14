import React, { useState, useEffect, useCallback, memo, MouseEvent } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Search.scss';

const { ipcRenderer, store } = window.api;

interface SearchProps extends WithTranslation {
  headers: HeadersObject | null;
  settings: Settings,
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  searchFieldRef: React.RefObject<HTMLInputElement>;
  t: typeof i18n.t;
}

const Search: React.FC<SearchProps> = memo(({
  headers,
  settings,
  searchString,
  setSearchString,
  searchFieldRef,
  t,
}) => {

  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>(store.getFilters('search'));

  const handleRemoveFilter = useCallback((event: MouseEvent, option: SearchFilter) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedFilters = searchFilters.filter(searchFilter => searchFilter.label !== option.label);
    setSearchFilters(updatedFilters);
  }, [searchFilters]);

  const handleAddNewFilter = useCallback((event: React.SyntheticEvent, value: string) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedFilters = [
      { label: value },
      ...searchFilters.filter(searchFilter => searchFilter.label !== value)
    ];
    setSearchFilters(updatedFilters);
  }, [searchFilters]);

  const handleAddTodo = useCallback(() => {
    if(searchString) {
      ipcRenderer.send('writeTodoToFile', -1, searchString);
    }
  }, [searchString]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isSearchFocused = document.activeElement === searchFieldRef.current;
    if (searchString && isSearchFocused && event.key === 'Escape') {
      setSearchString('');
    } else if (!searchString && isSearchFocused && event.key === 'Escape') {
      const isSearchOpen = !settings.isSearchOpen;
      store.setConfig('isSearchOpen', isSearchOpen);
    } else if (isSearchFocused && searchString && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      handleAddTodo();
    }
  }, [searchFieldRef, searchString, settings.isSearchOpen]);

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
      searchFieldRef.current.focus();
    }
  }, [settings.isSearchOpen, searchFieldRef]);

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
            onChange={(event, value: string | SearchFilter | null) => {
              if (value && typeof value !== 'string' && value.inputValue) {
                handleAddNewFilter(event, value.inputValue);
              }
            }}
            options={searchFilters}
            filterOptions={(options: (string | SearchFilter)[], params) => {
              const filter = createFilterOptions<SearchFilter>();
              const filtered: SearchFilter[] = filter(options as SearchFilter[], params);
              const { inputValue } = params;
              const isExisting = filtered.some(filter => filter.label && filter.label.includes(inputValue));
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Create filter "${inputValue}"`,
                });
              }
              return filtered;
            }}
            inputValue={searchString}
            onInputChange={(_, value) => setSearchString(value)}
            getOptionLabel={(option: SearchFilter | string): string => {
              if (typeof option === 'string') {
                return option;
              } else if (option.label) {
                return option.label;
              } else if (option.inputValue) {
                return option.inputValue;
              }
            }}
            renderOption={(props, option: string | SearchFilter) => (
              <li
                {...props}
                data-testid={option.inputValue ? "header-search-autocomplete-create" : "header-search-autocomplete-select"}
              >
                {option.inputValue !== undefined ? (
                  <>
                    <AddCircleIcon />
                    {option.title}
                  </>
                ) : (
                  <>
                    <RemoveCircleIcon
                      onClick={(event) => {
                        event.stopPropagation();
                        if(typeof option !== 'string') {
                          handleRemoveFilter(event, option);
                        }
                      }}
                      data-testid="header-search-autocomplete-remove"
                    />
                    {typeof option !== 'string' && option.label}
                  </>
                )}
              </li>
            )}
            renderInput={(params) => (
              <>
                <TextField
                  {...params}
                  data-testid="header-search-textfield"
                  placeholder={`${t('search.visibleTodos')} ${headers?.visibleObjects}`}
                  inputRef={searchFieldRef}
                />
              </>
            )}
          />
          {searchString && searchString.length > 0 && (
            <>
              <Button
                onClick={handleAddTodo}
                data-testid="header-search-textfield-add-todo"
              >
                {t('search.addAsTodo')}
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
});

export default withTranslation()(Search);
