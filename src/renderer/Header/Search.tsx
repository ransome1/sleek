import React, { useState, useEffect, ChangeEvent, useCallback, memo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
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

  const [searchFilters, setSearchFilters] = useState<SearchFilters>(store.getFilters('search'));

  const handleRemoveFilter = (event, option) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedFilters = searchFilters.filter(searchFilter => searchFilter.label !== option.label);
    setSearchFilters(updatedFilters);
  }

  const handleAddNewFilter = (event, option) => {
    event.stopPropagation();
    event.preventDefault();
    if(option.inputValue) {
      const updatedFilters = [
        { label: option.inputValue },
        ...searchFilters.filter(searchFilter => searchFilter.label !== option.label)
      ];
      setSearchFilters(updatedFilters);      
    }
  }

  const handleAddTodo = () => {
    if(searchString) {
      ipcRenderer.send('writeTodoToFile', -1, searchString);
    }
  };

  const handleXClick = () => {
    setSearchString('');
    searchFieldRef.current?.focus();
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isSearchFocused = document.activeElement === searchFieldRef.current;
    if (searchString && isSearchFocused && event.key === 'Escape') {
      setSearchString('');
    } else if (!searchString && isSearchFocused && event.key === 'Escape') {
      const isSearchOpen = !settings.isSearchOpen;
      store.set('isSearchOpen', isSearchOpen);
    } else if (isSearchFocused && searchString && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      handleAddTodo();
    }
  }, [searchFieldRef, searchString]);

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
    ipcRenderer.send('storeSetFilters', 'search', searchFilters);
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
        <div id='Search' className={settings.isSearchOpen ? 'active' : ''}>
          <Autocomplete
            freeSolo
            onChange={(event, option) => {
              if(event.key === 'Enter' && option.inputValue) {
                handleAddNewFilter(event, option);
              }
            }}
            options={searchFilters}
            filterOptions={(options, params) => {
              const filter = createFilterOptions<FilmOptionType>();
              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = filtered.some(filter => filter.label.includes(inputValue));
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  title: `Create filter "${inputValue}"`,
                });
              }
              return filtered;
            }}       
            inputValue={searchString}
            onInputChange={(event, value) => {
              setSearchString(value);
            }}
            getOptionLabel={(option) => {
              if (option.label) {
                return option.label;
              } else if (option.inputValue) {
                return option.inputValue;
              } else {
                return searchString;
              }
            }}
            renderOption={(props, option) => (
              <li
                {...props}
                onClick={(event) => {
                  if (option.label) {
                    setSearchString(option.label)
                  } else if(option.inputValue) {
                    handleAddNewFilter(event, option);
                    setSearchString(option.inputValue)
                  }
                }}
              >
                {option.inputValue !== undefined ? (
                  <>
                    <AddCircleIcon />
                    {option.title}
                  </>
                ) : (
                  <>
                    <RemoveCircleIcon
                      onClick={(event) => handleRemoveFilter(event, option)}
                    />
                    {option.label}
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
