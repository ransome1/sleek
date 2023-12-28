import React, { useEffect, ChangeEvent, useCallback, memo } from 'react';
import { TextField, InputAdornment, Button, Box } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Search.scss';

const { ipcRenderer, store } = window.api;

interface Props extends WithTranslation {
  headers: HeadersObject | null;
  settings: Settings,
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  searchFieldRef: React.RefObject<HTMLInputElement>;
  t: typeof i18n.t;
}

const Search: React.FC<Props> = memo(({
  headers,
  settings,
  searchString,
  setSearchString,
  searchFieldRef,
  t,
}) => {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

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
    } else if (searchString && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
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
        <Box id='Search' className={settings.isSearchOpen ? 'active' : ''}>
          <TextField
            variant='outlined'
            placeholder={`${t('search.visibleTodos')} ${headers?.visibleObjects}`}
            inputRef={searchFieldRef}
            value={searchString}
            onChange={handleInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  {searchString && searchString.length > 0 && (
                    <Button onClick={handleAddTodo}>{t('search.addAsTodo')}</Button>
                  )}
                  {searchString && searchString.length > 0 && (
                    <button
                      tabIndex={0}
                      className='xClick'
                      onClick={handleXClick}
                    >
                      <CancelIcon />
                    </button>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
    </>
  );
});

export default withTranslation()(Search);
