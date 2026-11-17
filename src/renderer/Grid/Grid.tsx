import React, {
  memo,
  ReactElement,
  ReactNode,
  useState,
  useCallback,
  useRef,
} from "react";
import List from "@mui/material/List";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  KeyboardCoordinateGetter,
  DragOverlay,
  useDndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SnackbarAction } from "../../@types";
import Row from "./Row";
import {
  findItemLocation,
  applyDragOver,
  computeToLineNumber,
  getAttributeChange,
} from "./dragAndDrop";
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
} from "../../@types";

const { ipcRenderer } = window.api;

const keyboardCoordinatesGetter: KeyboardCoordinateGetter = (
  event,
  { context },
) => {
  const { active, over } = context;
  if (!active || !over) return;

  const delta = 35;
  switch (event.key) {
    case "ArrowDown":
      return { x: 0, y: delta };
    case "ArrowUp":
      return { x: 0, y: -delta };
    default:
      return undefined;
  }
};

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
  onNotification: React.Dispatch<SnackbarAction>;
  setTodoData: React.Dispatch<React.SetStateAction<TodoData | null>>;
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
    onNotification,
    setTodoData,
  }) => {
    const renderedRowsRef = useRef<number[]>([]);
    const listRef = useRef<HTMLUListElement>(null);
    const sortKeyValueRef = useRef(settings.sorting[0].value);
    sortKeyValueRef.current = settings.sorting[0].value;
    const fileSortingRef = useRef(settings.fileSorting);
    fileSortingRef.current = settings.fileSorting;
    const [loadMoreRows, setLoadMoreRows] = useState(false);
    const [maxRows, setMaxRows] = useState(
      Math.floor(window.innerHeight / 35) * 2,
    );
    const [justDragged, setJustDragged] = useState(false);
    const [activeId, setActiveId] = useState<number | null>(null);

    const todoDataRef = useRef(todoData);
    todoDataRef.current = todoData;
    const originalTodoDataRef = useRef<TodoData | null>(null);
    const originalGroupRef = useRef<string | null>(null);
    const activeTodoObjectRef = useRef<TodoObject | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: keyboardCoordinatesGetter,
      }),
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
      const activeId = event.active.id as number;
      setActiveId(activeId);
      originalTodoDataRef.current = todoDataRef.current;

      if (todoDataRef.current) {
        const location = findItemLocation(todoDataRef.current, activeId);
        if (location) {
          originalGroupRef.current = JSON.stringify(
            todoDataRef.current[location.groupIndex].title,
          );
          activeTodoObjectRef.current = location.todoObject;
        }
      }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      const insertAfter =
        !!activeRect &&
        activeRect.top + activeRect.height / 2 >
          overRect.top + overRect.height / 2 + 2;

      setTodoData(
        (prev) =>
          prev &&
          applyDragOver(
            prev,
            active.id as number,
            over.id as number,
            insertAfter,
          ),
      );
    }, []);

    const handleDragCancel = useCallback(() => {
      setActiveId(null);
      if (originalTodoDataRef.current) {
        setTodoData(originalTodoDataRef.current);
        originalTodoDataRef.current = null;
      }
      originalGroupRef.current = null;
      activeTodoObjectRef.current = null;
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
      const activeId = event.active.id as number;
      setActiveId(null);

      setJustDragged(true);
      setTimeout(() => {
        setJustDragged(false);
      }, 100);

      const currentTodoData = todoDataRef.current;
      if (!currentTodoData) {
        originalTodoDataRef.current = null;
        originalGroupRef.current = null;
        return;
      }

      const activeLoc = findItemLocation(currentTodoData, activeId);
      if (!activeLoc) {
        originalTodoDataRef.current = null;
        originalGroupRef.current = null;
        return;
      }

      const currentGroupTitle = JSON.stringify(
        currentTodoData[activeLoc.groupIndex].title,
      );

      // handleDragOver has already moved the row, so its current position is the drop position.
      const targetGroup = currentTodoData[activeLoc.groupIndex];
      const toLineNumber = computeToLineNumber(
        targetGroup.todoObjects,
        activeLoc.itemIndex,
        activeId,
      );

      if (originalGroupRef.current !== currentGroupTitle) {
        const attributeChange = getAttributeChange(
          activeLoc.todoObject,
          targetGroup.title,
          sortKeyValueRef.current,
        );
        if (attributeChange) {
          ipcRenderer.send(
            "moveTodoLine",
            activeId,
            toLineNumber,
            attributeChange.type,
            attributeChange.value,
          );
        } else if (originalTodoDataRef.current) {
          setTodoData(originalTodoDataRef.current);
        }
      } else if (!fileSortingRef.current) {
        // Grouped views sort within groups by the sorting settings, so a reorder there would not stick.
        if (originalTodoDataRef.current) {
          setTodoData(originalTodoDataRef.current);
        }
      } else {
        const originalLoc = originalTodoDataRef.current
          ? findItemLocation(originalTodoDataRef.current, activeId)
          : null;
        if (originalLoc?.itemIndex !== activeLoc.itemIndex) {
          ipcRenderer.send("reorderTodoLines", activeId, toLineNumber);
        }
      }

      originalTodoDataRef.current = null;
      originalGroupRef.current = null;
      activeTodoObjectRef.current = null;
    }, []);

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
        const closest = (event.target as HTMLElement).closest("li");
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
      const list = listRef.current;
      if (list) {
        const a: number = list.scrollTop;
        const b: number = list.scrollHeight - list.clientHeight;
        const c: number = a / b;

        if (
          c >= 0.85 &&
          renderedRowsRef.current.length < headers.availableObjects
        ) {
          setLoadMoreRows(true);
        }

        if (loadMoreRows) {
          setLoadMoreRows(false);
          setMaxRows((maxRows) => maxRows + 30);
          ipcRenderer.send("requestData", searchString);
        }
      }
    };

    renderedRowsRef.current = [];

    if (headers.visibleObjects === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <List
          ref={listRef}
          id="grid"
          onScroll={handleScroll}
          onKeyUp={handleKeyUp}
        >
          {todoData &&
            todoData.map((group, groupIndex) => {
              if (!group.visible) {
                return null;
              }

              return (
                <React.Fragment
                  key={`group-${groupIndex}-${group.title?.toString()}`}
                >
                  <Group
                    attributeKey={settings.sorting[0].value}
                    value={group.title}
                    filters={filters}
                    setContextMenu={setContextMenu}
                    settings={settings}
                    onNotification={onNotification}
                  />
                  <div
                    className={`group-spacer${activeId != null ? " active" : ""}`}
                  />
                  <SortableContext
                    items={group.todoObjects.map((obj) => obj.lineNumber)}
                    strategy={verticalListSortingStrategy}
                  >
                    {((): ReactNode => {
                      const rows = [] as ReactElement[];
                      for (let i = 0; i < group.todoObjects.length; i++) {
                        const todoObject = group.todoObjects[i];

                        if (renderedRowsRef.current.length >= maxRows) {
                          break;
                        } else if (
                          renderedRowsRef.current.includes(
                            todoObject.lineNumber,
                          )
                        ) {
                          continue;
                        }

                        renderedRowsRef.current.push(todoObject.lineNumber);

                        rows.push(
                          <Row
                            key={`row-${todoObject.lineNumber}`}
                            todoObject={todoObject}
                            filters={filters}
                            setTodoObject={setTodoObject}
                            setDialogOpen={setDialogOpen}
                            setContextMenu={setContextMenu}
                            setPromptItem={setPromptItem}
                            settings={settings}
                            onNotification={onNotification}
                            justDragged={justDragged}
                            activeId={activeId}
                          />,
                        );
                      }
                      return rows;
                    })()}
                  </SortableContext>
                  <div
                    className={`group-spacer${activeId != null ? " active" : ""}`}
                  />
                </React.Fragment>
              );
            })}
        </List>
        <DragOverlayWrapper
          activeTodoObject={activeTodoObjectRef.current}
          todoData={todoData}
          filters={filters}
          setTodoObject={setTodoObject}
          setDialogOpen={setDialogOpen}
          setContextMenu={setContextMenu}
          setPromptItem={setPromptItem}
          settings={settings}
          onNotification={onNotification}
        />
      </DndContext>
    );
  },
);

interface DragOverlayWrapperProps {
  activeTodoObject: TodoObject | null;
  todoData: TodoData | null;
  filters: Filters | null;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: SettingStore;
  onNotification: React.Dispatch<SnackbarAction>;
}

const DragOverlayWrapper: React.FC<DragOverlayWrapperProps> = memo(
  ({
    activeTodoObject,
    todoData,
    filters,
    setTodoObject,
    setDialogOpen,
    setContextMenu,
    setPromptItem,
    settings,
    onNotification,
  }) => {
    const { active } = useDndContext();
    const activeId = active?.id as number | undefined;

    if (activeId == null || !todoData) return null;

    const resolvedTodoObject =
      activeTodoObject ?? findItemLocation(todoData, activeId)?.todoObject;

    if (!resolvedTodoObject) return null;

    return (
      <DragOverlay dropAnimation={null}>
        <Row
          todoObject={resolvedTodoObject}
          filters={filters}
          setTodoObject={setTodoObject}
          setDialogOpen={setDialogOpen}
          setContextMenu={setContextMenu}
          setPromptItem={setPromptItem}
          settings={settings}
          onNotification={onNotification}
          justDragged={false}
        />
      </DragOverlay>
    );
  },
);

DragOverlayWrapper.displayName = "DragOverlayWrapper";

GridComponent.displayName = "GridComponent";

export default GridComponent;
