import React, { useState, useEffect, useCallback, memo, MouseEvent } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
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
  setPromptItem: React.Dispatch<React.SetStateAction<PrompItem>>;
  t: typeof i18n.t;
}

const Search: React.FC<SearchProps> = memo(({
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

  const toggleSuppress = (option) => {
    const updatedFilters = searchFilters.map(searchFilter => {
      if (searchFilter.label === option.label) {
        return { ...searchFilter, suppress: !option.suppress };
      }
      return searchFilter;
    });
    setSearchFilters(updatedFilters);
  }

  const handleDeleteFilterConfirm = (option) => {
    const updatedFilters = searchFilters.filter(searchFilter => searchFilter.label !== option.label);
    setSearchFilters(updatedFilters);
  };

  const handleDeleteFilter = useCallback((event: MouseEvent, option: SearchFilter) => {
    event.stopPropagation();
    event.preventDefault();
    setPromptItem({
      id: 'confirmSearchFilterDelete',
      headline: 'Delete search filter',
      text: `This will delete search filter <code>${option.label}</code>`,
      button1: 'Delete',
      onButton1: () => handleDeleteFilterConfirm(option),
    });
  }, [searchFilters]);

  const handleAddNewFilter = useCallback((event: React.SyntheticEvent, value: string) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedFilters = [
      { label: value, suppress: false },
      ...searchFilters.filter(searchFilter => searchFilter.label !== value)
    ];
    setSearchFilters(updatedFilters);
  }, [searchFilters]);

  const handleAddTodo = useCallback(() => {
    if(searchString) {
      ipcRenderer.send('writeTodoToFile', -1, searchString);
    }
  }, [searchString]);

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isSearchFocused = document.activeElement === searchFieldRef.current;
    if(!isAutocompleteOpen && isSearchFocused && event.key === 'ArrowDown') {
      setIsAutocompleteOpen(true);
    } else if (searchString && isSearchFocused && event.key === 'Escape') {
      setSearchString('');
    } else if (!searchString && isSearchFocused && event.key === 'Escape') {
      const isSearchOpen = !settings.isSearchOpen;
      store.setConfig('isSearchOpen', isSearchOpen);
    } else if (isSearchFocused && searchString && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      handleAddTodo();
    } else if((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'f') {
      searchFieldRef?.current?.focus();
      setIsAutocompleteOpen(!isAutocompleteOpen);
    }
  }, [searchFieldRef, searchString, settings.isSearchOpen, isAutocompleteOpen]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if(isAutocompleteOpen && (event.key === 'Escape' || event.key === 'Enter')) {
      setIsAutocompleteOpen(false);
    }
  }, [isAutocompleteOpen]);    

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
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
            onChange={(event, value: string | SearchFilter | null) => {
              setIsAutocompleteOpen(false)
              if (value && typeof value !== 'string' && value.inputValue) {
                handleAddNewFilter(event, value.inputValue);
              }
            }}
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
                          handleDeleteFilter(event, option);
                        }
                      }}
                      data-testid="header-search-autocomplete-remove"
                    />
                    {option.suppress === false ? (
                      <NotificationsOffIcon
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSuppress(option);
                        }}
                        className="greyedOut"
                        data-testid="header-search-autocomplete-notification-disable"
                      />
                    ) : (
                      <NotificationsOffIcon
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSuppress(option);
                        }}                      
                        data-testid="header-search-autocomplete-notification-enable"
                      />
                    )}
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
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        {searchFilters.length > 0 || searchString ? (
                          <IconButton 
                            tabIndex={0}
                            onClick={() => setIsAutocompleteOpen(!isAutocompleteOpen)} 
                            data-testid="header-search-clear-icon"
                          >
                            {isAutocompleteOpen ? (
                              <ArrowDropUpIcon />
                            ) : (
                              <ArrowDropDownIcon />
                            )}
                          </IconButton>
                        ) : (
                          <IconButton 
                            disabled 
                            data-testid="header-search-clear-icon"
                          >
                            <ArrowDropDownIcon style={{ color: 'gray' }} />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {searchString && searchString.length > 0 && (
                          <Button onClick={handleAddTodo} data-testid="header-search-textfield-add-todo">
                            <AddIcon />
                            {t('search.addAsTodo')}
                          </Button>
                        )}
                        <IconButton tabIndex={0} onClick={() => setSearchString('')} data-testid="header-search-clear-icon">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}                  
                />
              </>
            )}
          />
        </div>
      )}
    </>
  );
});

export default withTranslation()(Search);
