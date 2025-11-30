import React, { useEffect, memo } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ClearIcon from '@mui/icons-material/Clear'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { WithTranslation, withTranslation } from 'react-i18next'
import { i18n } from '../../Settings/LanguageSelector'

const { ipcRenderer, store } = window.api

interface InputComponentProps extends WithTranslation {
  headers: HeadersObject | null
  searchString: string
  setSearchString: React.Dispatch<React.SetStateAction<string>>
  searchFilters: SearchFilter[]
  searchFieldRef: React.RefObject<HTMLInputElement>
  isAutocompleteOpen: boolean
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>
  settings: Settings
  t: typeof i18n.t
}

const handleAddTodo = (searchString: string): void => {
  if (searchString) {
    ipcRenderer.send('writeTodoToFile', -1, searchString)
  }
}

const InputComponent: React.FC<InputComponentProps> = memo(
  ({
    headers,
    searchString,
    setSearchString,
    searchFilters,
    searchFieldRef,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    settings,
    t,
    ...params
  }) => {
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        event.stopPropagation()
        const isSearchFocused = document.activeElement === searchFieldRef.current
        if (
          isSearchFocused &&
          searchString &&
          (event.metaKey || event.ctrlKey) &&
          event.key === 'Enter'
        ) {
          handleAddTodo(searchString)
        } else if (searchString && isSearchFocused && event.key === 'Escape') {
          setSearchString('')
        } else if (!searchString && isSearchFocused && event.key === 'Escape') {
          store.setConfig('isSearchOpen', !settings.isSearchOpen)
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return (): void => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [searchString, searchFieldRef, settings.isSearchOpen])

    return (
      <TextField
        {...params}
        data-testid="header-search-textfield"
        placeholder={`Todos in file ${headers?.availableObjects}`}
        inputRef={searchFieldRef}
        InputProps={{
          ...params.InputProps,
          startAdornment: (
            <InputAdornment position="start">
              {searchFilters?.length > 0 || searchString ? (
                <IconButton tabIndex={0} onClick={() => setIsAutocompleteOpen(!isAutocompleteOpen)}>
                  {isAutocompleteOpen ? (
                    <ExpandMoreIcon
                      className="invert"
                      data-testid="header-search-textfield-hide-filters"
                    />
                  ) : (
                    <ExpandMoreIcon data-testid="header-search-textfield-show-filters" />
                  )}
                </IconButton>
              ) : (
                <IconButton disabled data-testid="header-search-clear-icon">
                  <ExpandMoreIcon style={{ color: 'gray' }} />
                </IconButton>
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {searchString &&
                searchString.length > 0 && !searchFilters?.some((filter) => filter.label === searchString) && (
                  <button
                    onClick={() => handleAddTodo(searchString)}
                    data-testid="header-search-textfield-add-todo"
                    variant="outlined"
                    className="addAsTodo"
                  >
                    {t('search.addAsTodo')}
                  </button>
                )}
              <IconButton
                tabIndex={0}
                onClick={() =>
                  ipcRenderer.send(
                    'openInBrowser',
                    'https://github.com/todotxt/todo.txt'
                  )
                }
                data-testid="header-search-clear-icon"
              >
                <HelpOutlineIcon />
              </IconButton>
              {searchString && searchString.length > 0 && (
                <IconButton
                  tabIndex={0}
                  onClick={() => setSearchString('')}
                  data-testid="header-search-clear-icon"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          )
        }}
      />
    )
  }
)

InputComponent.displayName = 'InputComponent'

export default withTranslation()(InputComponent)
