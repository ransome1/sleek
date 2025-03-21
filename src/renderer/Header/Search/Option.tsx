import React, { memo, MouseEvent, Fragment, useCallback, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { withTranslation, WithTranslation } from 'react-i18next'
import './Option.scss'

const toggleSuppress = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
): void => {
  const updatedFilters = searchFilters.map((searchFilter) => {
    if (searchFilter.label === option.label) {
      return { ...searchFilter, suppress: !option.suppress }
    }
    return searchFilter
  })
  setSearchFilters(updatedFilters)
}

const handleDeleteFilterConfirm = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
): void => {
  const updatedFilters = searchFilters.filter((searchFilter) => searchFilter.label !== option.label)
  setSearchFilters(updatedFilters)
}

interface OptionComponentProps extends WithTranslation {
  option: SearchFilter
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  searchFilters: SearchFilter[]
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
  isAutocompleteOpen: boolean
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>
  t: typeof i18n.t
}

const OptionComponent: React.FC<OptionComponentProps> = memo(
  ({
    option,
    setPromptItem,
    searchFilters,
    setSearchFilters,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    t,
    ...props
  }) => {
    const handleDeleteFilter = (
      event: MouseEvent,
      option: SearchFilter,
      setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>,
      searchFilters: SearchFilter[],
      setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
    ): void => {
      event.stopPropagation()
      event.preventDefault()
      setPromptItem({
        id: 'confirmSearchFilterDelete',
        headline: t('prompt.searchFilters.delete.headline'),
        text: `${t('prompt.searchFilters.delete.body')} <code>${option.label}</code>`,
        button1: t('delete'),
        onButton1: () => handleDeleteFilterConfirm(option, searchFilters, setSearchFilters)
      })
    }

    const handleKeyUp = useCallback(
      (event: KeyboardEvent): void => {
        if (isAutocompleteOpen && (event.key === 'Escape' || event.key === 'Enter')) {
          setIsAutocompleteOpen(false)
        }
      },
      [isAutocompleteOpen]
    )

    useEffect(() => {
      document.addEventListener('keyup', handleKeyUp)
      return (): void => {
        document.removeEventListener('keyup', handleKeyUp)
      }
    }, [handleKeyUp])

    return (
      <li
        data-testid={
          option.inputValue
            ? 'header-search-autocomplete-create'
            : 'header-search-autocomplete-select'
        }
        {...props}
      >
        {option.inputValue ? (
          <>
            <AddCircleIcon data-testid="header-search-autocomplete-add" />
            <Fragment>
              <span dangerouslySetInnerHTML={{ __html: option.title }} />
            </Fragment>
          </>
        ) : (
          <>
            <RemoveCircleIcon
              onClick={(event) => {
                event.stopPropagation()
                handleDeleteFilter(event, option, setPromptItem, searchFilters, setSearchFilters)
              }}
              data-testid="header-search-autocomplete-remove"
            />
            {option.suppress === false ? (
              <NotificationsOffIcon
                onClick={(event) => {
                  event.stopPropagation()
                  toggleSuppress(option, searchFilters, setSearchFilters)
                }}
                className="greyedOut"
                data-testid="header-search-autocomplete-notification-disable"
              />
            ) : (
              <NotificationsOffIcon
                onClick={(event) => {
                  event.stopPropagation()
                  toggleSuppress(option, searchFilters, setSearchFilters)
                }}
                data-testid="header-search-autocomplete-notification-enable"
              />
            )}
            <Typography>
              <code>{option.label}</code>
            </Typography>
          </>
        )}
      </li>
    )
  }
)

OptionComponent.displayName = 'OptionComponent'

export default withTranslation()(OptionComponent)
