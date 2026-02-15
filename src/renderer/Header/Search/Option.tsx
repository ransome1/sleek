import React, {
  memo,
  MouseEvent,
  Fragment,
  useCallback,
  useEffect,
} from "react";
import Typography from "@mui/material/Typography";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTranslation } from "react-i18next";
import "./Option.scss";
import { PromptItem, SearchFilter } from "@sleek-types";

const toggleSuppress = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>,
): void => {
  const updatedFilters = searchFilters.map((searchFilter) => {
    if (searchFilter.label === option.label) {
      return { ...searchFilter, suppress: !option.suppress };
    }
    return searchFilter;
  });
  setSearchFilters(updatedFilters);
};

const handleDeleteFilterConfirm = (
  option: SearchFilter,
  searchFilters: SearchFilter[],
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>,
): void => {
  const updatedFilters = searchFilters.filter(
    (searchFilter) => searchFilter.label !== option.label,
  );
  setSearchFilters(updatedFilters);
};

interface OptionComponentProps {
  option: string | SearchFilter;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  searchFilters: SearchFilter[];
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>;
  isAutocompleteOpen: boolean;
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const OptionComponent: React.FC<OptionComponentProps> = memo(
  ({
    option,
    setPromptItem,
    searchFilters,
    setSearchFilters,
    isAutocompleteOpen,
    setIsAutocompleteOpen,
    ...props
  }) => {
    const { t } = useTranslation();

    const handleDeleteFilter = (
      event: MouseEvent,
      option: SearchFilter,
      setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>,
      searchFilters: SearchFilter[],
      setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilter[]>>,
    ): void => {
      event.stopPropagation();
      event.preventDefault();
      setPromptItem({
        id: "confirmSearchFilterDelete",
        headline: t("prompt.searchFilters.delete.headline"),
        text: `${t("prompt.searchFilters.delete.body")} <code>${option.label}</code>`,
        button1: t("delete"),
        onButton1: () =>
          handleDeleteFilterConfirm(option, searchFilters, setSearchFilters),
      });
    };

    const handleKeyUp = useCallback(
      (event: KeyboardEvent): void => {
        if (
          isAutocompleteOpen &&
          (event.key === "Escape" || event.key === "Enter")
        ) {
          setIsAutocompleteOpen(false);
        }
      },
      [isAutocompleteOpen],
    );

    useEffect(() => {
      document.addEventListener("keyup", handleKeyUp);
      return (): void => {
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [handleKeyUp]);

    const isSearchFilter = typeof option !== "string";

    return (
      <li
        data-testid={
          isSearchFilter && option.inputValue
            ? "header-search-autocomplete-create"
            : "header-search-autocomplete-select"
        }
        {...props}
      >
        {isSearchFilter && option.inputValue ? (
          <>
            <AddCircleIcon data-testid="header-search-autocomplete-add" />
            <Fragment>
              <span dangerouslySetInnerHTML={{ __html: option.title || "" }} />
            </Fragment>
          </>
        ) : (
          <>
            {isSearchFilter && (
              <RemoveCircleIcon
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteFilter(
                    event,
                    option,
                    setPromptItem,
                    searchFilters,
                    setSearchFilters,
                  );
                }}
                data-testid="header-search-autocomplete-remove"
              />
            )}
            {isSearchFilter && option.suppress === false && (
              <NotificationsOffIcon
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSuppress(option, searchFilters, setSearchFilters);
                }}
                className="greyedOut"
                data-testid="header-search-autocomplete-notification-disable"
              />
            )}
            {isSearchFilter && option.suppress !== false && (
              <NotificationsOffIcon
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSuppress(option, searchFilters, setSearchFilters);
                }}
                data-testid="header-search-autocomplete-notification-enable"
              />
            )}
            {isSearchFilter && (
              <Typography>
                <code>{option.label}</code>
              </Typography>
            )}
            {!isSearchFilter && (
              <Typography>
                <code>{option}</code>
              </Typography>
            )}
          </>
        )}
      </li>
    );
  },
);

OptionComponent.displayName = "OptionComponent";

export default OptionComponent;
