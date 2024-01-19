import React, { memo, MouseEvent, Fragment, useCallback, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { withTranslation, WithTranslation } from 'react-i18next';
import './Option.scss';

const toggleSuppress = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
) => {
  const updatedFilters = searchFilters.map(searchFilter => {
    if (searchFilter.label === option.label) {
      return { ...searchFilter, suppress: !option.suppress };
    }
    return searchFilter;
  });
  setSearchFilters(updatedFilters);
};

const handleDeleteFilter = (
  event: MouseEvent,
  option: SearchFilter,
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
) => {
  event.stopPropagation();
  event.preventDefault();
  setPromptItem({
    id: 'confirmSearchFilterDelete',
    headline: 'Delete search filter',
    text: `This will delete search filter <code>${option.label}</code>`,
    button1: 'Delete',
    onButton1: () => handleDeleteFilterConfirm(option, searchFilters, setSearchFilters),
  });
};

const handleDeleteFilterConfirm = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>
) => {
  const updatedFilters = searchFilters.filter(searchFilter => searchFilter.label !== option.label);
  setSearchFilters(updatedFilters);
};

interface OptionComponentProps extends WithTranslation {
  option: SearchFilter;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem>>;
  searchFilters: SearchFilter[];
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>;
  isAutocompleteOpen: boolean;
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const OptionComponent: React.FC<OptionComponentProps> = memo(({
  option,
  setPromptItem,
  searchFilters,
  setSearchFilters,
  isAutocompleteOpen,
  setIsAutocompleteOpen,
  ...props
}) => {
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (isAutocompleteOpen && (event.key === 'Escape' || event.key === 'Enter')) {
      setIsAutocompleteOpen(false);
    }
  }, [isAutocompleteOpen]);

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp]);

  return (
    <li
      data-testid={option.inputValue ? "header-search-autocomplete-create" : "header-search-autocomplete-select"}
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
              event.stopPropagation();
              handleDeleteFilter(event, option, setPromptItem, searchFilters, setSearchFilters);
            }}
            data-testid="header-search-autocomplete-remove"
          />
          {option.suppress === false ? (
            <NotificationsOffIcon
              onClick={(event) => {
                event.stopPropagation();
                toggleSuppress(option, searchFilters, setSearchFilters);
              }}
              className="greyedOut"
              data-testid="header-search-autocomplete-notification-disable"
            />
          ) : (
            <NotificationsOffIcon
              onClick={(event) => {
                event.stopPropagation();
                toggleSuppress(option, searchFilters, setSearchFilters);
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
  );
});

export default withTranslation()(OptionComponent);