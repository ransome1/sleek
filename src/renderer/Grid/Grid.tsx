import React, { memo, ReactElement, ReactNode, useState } from "react";
import List from "@mui/material/List";
import Row from "./Row";
import Group from "./Group";
import "./Grid.scss";
import {
  ContextMenu,
  Filters,
  HeadersObject,
  PromptItem,
  SettingStore,
  TodoData,
  TodoObject,
} from "src/Types";

const { ipcRenderer } = window.api;

interface GridComponentProps {
  todoData: TodoData | null;
  filters: Filters | null;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: SettingStore;
  headers: HeadersObject;
  searchString: string | null;
}

const GridComponent: React.FC<GridComponentProps> = memo(
  ({
    todoData,
    filters,
    setDialogOpen,
    setContextMenu,
    setTodoObject,
    setPromptItem,
    settings,
    headers,
    searchString,
  }) => {
    const renderedRows: number[] = [];
    const list = document.getElementById("grid");
    const [loadMoreRows, setLoadMoreRows] = useState(false);
    const [maxRows, setMaxRows] = useState(
      Math.floor(window.innerHeight / 35) * 2,
    );

    const handleKeyUp: React.KeyboardEventHandler = (event): void => {
      if (event.key === "ArrowDown") {
        const listItems =
          document.querySelectorAll<HTMLElement>("li:not(.group)");
        const currentIndex = Array.from<Element>(listItems).indexOf(
          document.activeElement!,
        );
        const nextIndex = currentIndex + 1;
        const nextElement = listItems[nextIndex];
        if (nextElement) {
          nextElement.focus();
        }
      } else if (event.key === "ArrowUp") {
        const listItems =
          document.querySelectorAll<HTMLElement>("li:not(.group)");
        const currentIndex: number = Array.from<Element>(listItems).indexOf(
          document.activeElement!,
        );
        const prevIndex: number = currentIndex - 1;
        const prevElement: HTMLElement = listItems[prevIndex];
        if (prevElement) {
          prevElement.focus();
        }
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const closest =(event.target as HTMLElement).closest("li")
        if (!closest) return;
        const rowItems = closest.querySelectorAll<HTMLElement>(
            'button, input, select, a[href], [tabindex]:not([tabindex="-1"])',
          );
        const currentIndex = Array.from<Element>(rowItems).indexOf(
          document.activeElement!,
        );
        const nextIndex =
          event.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;
        const nextElement = rowItems[nextIndex];
        if (nextElement) {
          nextElement.focus();
        }
      }
    };

    const handleScroll = (): void => {
      if (list) {
        const a: number = list.scrollTop;
        const b: number = list.scrollHeight - list.clientHeight;
        const c: number = a / b;

        if (c >= 0.85 && renderedRows.length < headers.availableObjects) {
          setLoadMoreRows(true);
        }

        if (loadMoreRows) {
          setLoadMoreRows(false);
          setMaxRows((maxRows) => maxRows + 30);
          ipcRenderer.send("requestData", searchString);
        }
      }
    };

    if (headers.visibleObjects === 0) return null;

    return (
      <List id="grid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
        {todoData?.map((group) => {
          if (!group.visible) {
            return null;
          }
          return (
            <React.Fragment key={group.title}>
              <Group
                attributeKey={settings.sorting[0].value}
                value={group.title}
                filters={filters}
              />
              {((): ReactNode => {
                const rows = [] as ReactElement[];
                for (let i = 0; i < group.todoObjects.length; i++) {
                  const todoObject = group.todoObjects[i];

                  if (renderedRows.length >= maxRows) {
                    break;
                  } else if (renderedRows.includes(todoObject.lineNumber)) {
                    continue;
                  }

                  renderedRows.push(todoObject.lineNumber);

                  rows.push(
                    <Row
                      key={todoObject.lineNumber}
                      todoObject={todoObject}
                      filters={filters}
                      setTodoObject={setTodoObject}
                      setDialogOpen={setDialogOpen}
                      setContextMenu={setContextMenu}
                      setPromptItem={setPromptItem}
                      settings={settings}
                    />,
                  );
                }
                return rows;
              })()}
            </React.Fragment>
          );
        })}
      </List>
    );
  },
);

GridComponent.displayName = "GridComponent";

export default GridComponent;
