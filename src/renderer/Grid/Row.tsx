import React, { memo } from "react";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import CircleChecked from "@mui/icons-material/CheckCircle";
import CircleUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { withTranslation, WithTranslation } from "react-i18next";
import RendererComponent from "./Renderer";
import { HandleFilterSelect, IsSelected } from "../Shared";
import "./Row.scss";
import { i18n } from "../Settings/LanguageSelector";

const { ipcRenderer } = window.api;

type HandleButtonClickType = (
  event: React.MouseEvent | React.KeyboardEvent,
) => void;

interface RowProps extends WithTranslation {
  todoObject: TodoObject;
  filters: Filters | null;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: Settings;
  handleButtonClick: HandleButtonClickType;
  t: typeof i18n.t;
}

const Row: React.FC<RowProps> = memo(
  ({
    todoObject,
    filters,
    setDialogOpen,
    setTodoObject,
    setContextMenu,
    setPromptItem,
    settings,
    handleButtonClick,
    t,
  }) => {
    const handleConfirmDelete = (): void => {
      if (todoObject)
        ipcRenderer.send("removeLineFromFile", todoObject.lineNumber);
    };

    const handleSaveToClipboard = (): void => {
      if (todoObject) ipcRenderer.send("saveToClipboard", todoObject.string);
    };

    const handleContextMenu = (
      event: React.MouseEvent,
      todoString: string,
    ): void => {
      setContextMenu({
        event: event,
        items: [
          {
            id: "copy",
            label: t("copy"),
            function: handleSaveToClipboard,
          },
          {
            id: "delete",
            label: t("delete"),
            promptItem: {
              id: "delete",
              headline: t("prompt.delete.headline"),
              text: `${t("prompt.delete.text")}: <code>${todoString}</code>`,
              button1: t("delete"),
              onButton1: handleConfirmDelete,
            },
          },
        ],
      });
    };

    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
      ipcRenderer.send(
        "writeTodoToFile",
        todoObject.lineNumber,
        todoObject.string,
        event.target.checked,
        false,
      );
    };

    const preventDialog = (clickedElement): boolean => {
      let match = false;

      if (clickedElement.classList.contains("MuiChip-label")) match = true;
      if (
        clickedElement.getAttribute("data-testid") === "datagrid-picker-date-t"
      )
        match = true;
      if (
        clickedElement.getAttribute("data-testid") ===
        "datagrid-picker-date-due"
      )
        match = true;
      // if (clickedElement.closest('.filter')) {
      //   const foundElement = clickedElement.closest('.filter');
      //   if(foundElement.getAttribute('data-todotxt-attribute') === 'due' || foundElement.getAttribute('data-todotxt-attribute') === 't') {
      //     match = true
      //   }
      // }
      if (clickedElement.tagName.toLowerCase() === "a") match = true;
      if (clickedElement.tagName.toLowerCase() === "input") match = true;
      if (clickedElement.tagName.toLowerCase() === "button") match = true;
      if (clickedElement.tagName.toLowerCase() === "img") match = true;
      return match;
    };

    const handleRowClick = (
      event: React.MouseEvent | React.KeyboardEvent,
    ): void => {
      const clickedElement = event.target as HTMLElement;

      if (
        (event.type === "keydown" &&
          (event as React.KeyboardEvent).key === "Enter") ||
        event.type === "click"
      ) {
        if (!preventDialog(clickedElement) && todoObject) {
          event.preventDefault();
          setTodoObject(todoObject);
          setDialogOpen(true);
        }
      } else if (
        (event.metaKey || event.ctrlKey) &&
        ((event as React.KeyboardEvent).key === "Delete" ||
          (event as React.KeyboardEvent).key === "Backspace")
      ) {
        setPromptItem({
          id: "delete",
          headline: t("prompt.delete.headline"),
          text: `${t("prompt.delete.text")}: <code>${todoObject.string}</code>`,
          button1: t("delete"),
          onButton1: handleConfirmDelete,
        });
      } else if (
        (event.metaKey || event.ctrlKey) &&
        (event as React.KeyboardEvent).key === "c"
      ) {
        handleSaveToClipboard();
      }
    };

    return (
      <>
        <li
          tabIndex={0}
          key={todoObject.lineNumber}
          className="row"
          data-complete={todoObject.complete}
          data-hidden={todoObject.hidden}
          onClick={(event) => handleRowClick(event)}
          onKeyDown={(event) => handleRowClick(event)}
          onContextMenu={(event) => handleContextMenu(event, todoObject.string)}
          data-testid={`datagrid-row`}
          data-todotxt-attribute="priority"
          data-todotxt-value={todoObject.priority}
        >
          <Checkbox
            icon={<CircleUnchecked />}
            checkedIcon={<CircleChecked />}
            tabIndex={0}
            checked={todoObject.complete}
            onChange={handleCheckboxChange}
            inputProps={{ "data-testid": "datagrid-checkbox" }}
          />

          {(settings.sorting[0].value != "priority" || settings.fileSorting) &&
            todoObject.priority && (
              <span
                data-todotxt-attribute="priority"
                data-todotxt-value={todoObject.priority}
                className={
                  IsSelected("priority", filters, [todoObject.priority])
                    ? "selected filter"
                    : "filter"
                }
                data-testid={`datagrid-button-priority`}
              >
                <button
                  onClick={() =>
                    HandleFilterSelect(
                      "priority",
                      [todoObject.priority],
                      filters,
                      false,
                    )
                  }
                >
                  {todoObject.priority}
                </button>
              </span>
            )}

          {todoObject.completed && (
            <Tooltip
              title={`${t("shared.attributeMapping.completed")} ${todoObject.completed}`}
              arrow
            >
              <EventAvailableIcon
                data-todotxt-attribute="completed"
                data-testid={`datagrid-button-completed`}
              />
            </Tooltip>
          )}

          {todoObject.created && (
            <Tooltip
              title={`${t("shared.attributeMapping.created")} ${todoObject.created}`}
              arrow
            >
              <EventNoteIcon
                data-todotxt-attribute="created"
                data-testid={`datagrid-button-created`}
              />
            </Tooltip>
          )}

          {todoObject.hidden && (
            <VisibilityOffIcon data-todotxt-attribute="hidden " />
          )}

          <RendererComponent
            todoObject={todoObject}
            filters={filters}
            settings={settings}
          />
        </li>
      </>
    );
  },
);

Row.displayName = "Row";

export default withTranslation()(Row);
