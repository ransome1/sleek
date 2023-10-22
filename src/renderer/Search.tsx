import React, { useEffect, ChangeEvent } from 'react';
import { TextField, InputAdornment, Button, Box } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import './Search.scss';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  headers: { visibleObjects: string };
  searchString: string | null;
  setSearchString: (searchString: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  searchFieldRef: React.RefObject<HTMLInputElement>;
  t: typeof i18n.t;
}

const Search: React.FC<Props> = ({
  headers,
  searchString,
  setSearchString,
  isSearchOpen,
  searchFieldRef,
  t,
}) => {
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    setSearchString(searchString);
  };

  const handleAddTodo = () => {
    if (searchString) {
      ipcRenderer.send('writeTodoToFile', undefined, searchString);
      setSearchString('');
      searchFieldRef.current?.focus();
    }
  };

  const handleXClick = () => {
    setSearchString('');
    searchFieldRef.current?.focus();
  };

  useEffect(() => {
    if (searchString === null) return;

    let delayedSearch: NodeJS.Timeout;

    const handleSearch = () => {
      ipcRenderer.send('requestData', searchString);
    };

    delayedSearch = setTimeout(handleSearch, 200);

    return () => {
      clearTimeout(delayedSearch);
    };
  }, [searchString]);

  useEffect(() => {
    if (isSearchOpen && searchFieldRef.current) {
      searchFieldRef.current.focus();
    }
  }, [isSearchOpen, searchFieldRef]);

  return (
    <>
      {isSearchOpen && (
        <Box id='Search' className={isSearchOpen ? 'active' : ''}>
          <TextField
            variant='outlined'
            placeholder={`${t('search.visibleTodos')} ${headers.visibleObjects}`}

            inputRef={searchFieldRef}
            value={searchString === null ? '' : searchString}
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
};

export default withTranslation()(Search);
