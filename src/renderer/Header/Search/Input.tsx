import React, { useEffect, memo } from "react";
import TextField, { StandardTextFieldProps } from "@mui/material/TextField";
import { useForkRef } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ClearIcon from "@mui/icons-material/Clear";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import { HeadersObject, SearchFilter, SettingStore } from "@sleek-types";
import { useTranslation } from "react-i18next";

const { ipcRenderer, store } = window.api;

interface InputComponentProps {
  headers: HeadersObject | null;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
  searchFilters: SearchFilter[];
  searchFieldRef: React.RefObject<HTMLInputElement | null>;
  isAutocompleteOpen: boolean;
  setIsAutocompleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  settings: SettingStore;
  slotProps?: Partial<StandardTextFieldProps["slotProps"]> & {
    htmlInput?: { ref?: React.Ref<HTMLInputElement> };
  };
}

const handleAddTodo = (searchString: string): void => {
  if (searchString) {
    ipcRenderer.send("writeSingleTodoToFile", -1, searchString);
  }
};

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
    slotProps,
    ...params
  }) => {
    const { t } = useTranslation();

    const inputRef = useForkRef(searchFieldRef, slotProps?.htmlInput?.ref);
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        event.stopPropagation();
        const isSearchFocused =
          document.activeElement === searchFieldRef.current;
        if (
          isSearchFocused &&
          searchString &&
          (event.metaKey || event.ctrlKey) &&
          event.key === "Enter"
        ) {
          handleAddTodo(searchString);
        } else if (searchString && isSearchFocused && event.key === "Escape") {
          setSearchString("");
        } else if (!searchString && isSearchFocused && event.key === "Escape") {
          store.setConfig("isSearchOpen", !settings.isSearchOpen);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return (): void => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [searchString, searchFieldRef, settings.isSearchOpen]);

    return (
      <TextField
        {...params}
        data-testid="header-search-textfield"
        placeholder={t("search.visibleTodos", {
          visible: headers?.visibleObjects,
          total: headers?.availableObjects,
        })}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            startAdornment: (
              <InputAdornment position="start">
                {searchFilters?.length > 0 || searchString ? (
                  <IconButton
                    tabIndex={0}
                    onClick={() => setIsAutocompleteOpen(!isAutocompleteOpen)}
                  >
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
                    <ExpandMoreIcon style={{ color: "gray" }} />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchString &&
                  searchString.length > 0 &&
                  !searchFilters?.some(
                    (filter) => filter.label === searchString,
                  ) && (
                    <button
                      onClick={() => handleAddTodo(searchString)}
                      data-testid="header-search-textfield-add-todo"
                      className="addAsTodo"
                    >
                      {t("search.addAsTodo")}
                    </button>
                  )}
                <IconButton
                  tabIndex={0}
                  onClick={() =>
                    ipcRenderer.send(
                      "openInBrowser",
                      "https://github.com/ransome1/sleek/wiki/Filter-Expressions-for-Advanced-Search",
                    )
                  }
                  data-testid="header-search-clear-icon"
                >
                  <HelpOutlineOutlinedIcon />
                </IconButton>
                {searchString && searchString.length > 0 && (
                  <IconButton
                    tabIndex={0}
                    onClick={() => setSearchString("")}
                    data-testid="header-search-clear-icon"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          },
          htmlInput: {
            ...slotProps?.htmlInput,
            ref: inputRef,
          },
        }}
      />
    );
  },
);

InputComponent.displayName = "InputComponent";

export default InputComponent;
