import React, { memo, ReactElement, ReactNode, useState, useCallback, useRef, useMemo } from "react";
import List from "@mui/material/List";
import {
  DndContext,
  DragEndEvent,
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
  arrayMove,
} from "@dnd-kit/sortable";
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
} from "../../@types";

const { ipcRenderer } = window.api;

const supportedGroupKeys = ["priority", "due", "projects", "contexts"] as const;

const keyboardCoordinatesGetter: KeyboardCoordinateGetter = (
  event,
  { context }
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

const isDifferentGroup = (
  active: TodoObject,
  over: TodoObject,
  sortKey: string,
): boolean => {
  if (!supportedGroupKeys.includes(sortKey as typeof supportedGroupKeys[number])) {
    return false;
  }

  const activeValue = active[sortKey];
  const overValue = over[sortKey];

  if (Array.isArray(activeValue) && Array.isArray(overValue)) {
    return activeValue.join(",") !== overValue.join(",");
  }

  return activeValue !== overValue;
};

const getAttributeChangeForGroup = (
  active: TodoObject,
  over: TodoObject,
  sortKey: string,
): { type: string; value: string } | null => {
  if (sortKey === "priority") {
    return { type: "priority", value: over.priority ?? "-" };
  }

  if (sortKey === "due") {
    return { type: "due", value: over.due ?? "" };
  }

  if (sortKey === "projects" && over.projects && over.projects.length > 0) {
    const targetProject = over.projects[0];
    if (active.projects?.includes(targetProject)) return null;
    return { type: "projects", value: targetProject };
  }

  if (sortKey === "contexts" && over.contexts && over.contexts.length > 0) {
    const targetContext = over.contexts[0];
    if (active.contexts?.includes(targetContext)) return null;
    return { type: "contexts", value: targetContext };
  }

  return null;
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
    setTodoData,
  }) => {
    const renderedRowsRef = useRef<number[]>([]);
    const listRef = useRef<HTMLElement>(null);
    const sortKeyValueRef = useRef(settings.sorting[0].value);
    const fileSortingRef = useRef(settings.fileSorting);
    const [maxRows, setMaxRows] = useState(
      Math.floor(window.innerHeight / 35) * 2,
    );
    const [justDragged, setJustDragged] = useState(false);

    if (sortKeyValueRef.current !== settings.sorting[0].value) {
      sortKeyValueRef.current = settings.sorting[0].value;
    }
    if (fileSortingRef.current !== settings.fileSorting) {
      fileSortingRef.current = settings.fileSorting;
    }

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

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
          return;
        }

        setJustDragged(true);
        setTimeout(() => {
          setJustDragged(false);
        }, 100);

        const activeLineNumber = active.id as number;
        const overData = over.data.current;
        const overLineNumber = over.id as number;

        const activeTodoObject = active.data.current?.todoObject as TodoObject | undefined;
        const overTodoObject = overData?.todoObject as TodoObject | undefined;

        if (!activeTodoObject || !overTodoObject) return;

        const sortKey = sortKeyValueRef.current;

        if (!fileSortingRef.current) {
          const isCrossGroup = isDifferentGroup(activeTodoObject, overTodoObject, sortKey);

          if (isCrossGroup) {
            const attributeChange = getAttributeChangeForGroup(activeTodoObject, overTodoObject, sortKey);
            if (attributeChange) {
              ipcRenderer.send(
                "moveTodoLine",
                activeLineNumber,
                overLineNumber,
                attributeChange.type,
                attributeChange.value,
              );
              return;
            }
          }
        }

        if (activeLineNumber !== overLineNumber) {
          // Optimistic update before IPC call using functional setState
          setTodoData((prevTodoData) => {
            if (!prevTodoData) return prevTodoData;

            if (fileSortingRef.current) {
              // File-sorting mode: shallow clone todoData and arrayMove on todoData[0].todoObjects
              const oldIndex = prevTodoData[0].todoObjects.findIndex(
                (obj) => obj.lineNumber === activeLineNumber,
              );
              const newIndex = prevTodoData[0].todoObjects.findIndex(
                (obj) => obj.lineNumber === overLineNumber,
              );

              if (oldIndex !== -1 && newIndex !== -1) {
                const newTodoData = [...prevTodoData];
                newTodoData[0] = {
                  ...prevTodoData[0],
                  todoObjects: arrayMove(prevTodoData[0].todoObjects, oldIndex, newIndex),
                };
                return newTodoData;
              }
            } else {
              // Grouped mode: find the group containing both items and arrayMove within it
              for (let i = 0; i < prevTodoData.length; i++) {
                const group = prevTodoData[i];
                const oldIndex = group.todoObjects.findIndex(
                  (obj) => obj.lineNumber === activeLineNumber,
                );
                const newIndex = group.todoObjects.findIndex(
                  (obj) => obj.lineNumber === overLineNumber,
                );

                if (oldIndex !== -1 && newIndex !== -1) {
                  // Same-group drag: shallow clone todoData and the group's todoObjects
                  const newTodoData = [...prevTodoData];
                  newTodoData[i] = {
                    ...group,
                    todoObjects: arrayMove(group.todoObjects, oldIndex, newIndex),
                  };
                  return newTodoData;
                }
              }
              // Cross-group drag: skip optimistic update (handled by attribute change above)
            }
            return prevTodoData;
          });

          ipcRenderer.send("reorderTodoLines", activeLineNumber, overLineNumber);
        }
      },
      [],
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

        if (c >= 0.85 && renderedRowsRef.current.length < headers.availableObjects) {
          setMaxRows((prev) => prev + 30);
          ipcRenderer.send("requestData", searchString);
        }
      }
    };

    renderedRowsRef.current = [];

    const allRowIds: number[] = useMemo(() => {
      const ids: number[] = [];
      if (todoData) {
        for (const group of todoData) {
          if (group.visible) {
            for (const todoObject of group.todoObjects) {
              ids.push(todoObject.lineNumber);
            }
          }
        }
      }
      return ids;
    }, [todoData]);

    if (headers.visibleObjects === 0) return null;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allRowIds}
          strategy={verticalListSortingStrategy}
        >
          <List ref={listRef as any} id="grid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
            {todoData &&
              todoData.map((group) => {
                if (!group.visible) {
                  return null;
                }

                return (
                  <React.Fragment key={group.title?.toString()}>
                    <Group
                      attributeKey={settings.sorting[0].value}
                      value={group.title}
                      filters={filters}
                    />
                    {((): ReactNode => {
                      const rows = [] as ReactElement[];
                      for (let i = 0; i < group.todoObjects.length; i++) {
                        const todoObject = group.todoObjects[i];

                        if (renderedRowsRef.current.length >= maxRows) {
                          break;
                        } else if (renderedRowsRef.current.includes(todoObject.lineNumber)) {
                          continue;
                        }

                        renderedRowsRef.current.push(todoObject.lineNumber);

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
                            justDragged={justDragged}
                          />,
                        );
                      }
                      return rows;
                    })()}
                  </React.Fragment>
                );
              })}
          </List>
        </SortableContext>
        <DragOverlayWrapper
          todoData={todoData}
          filters={filters}
          setTodoObject={setTodoObject}
          setDialogOpen={setDialogOpen}
          setContextMenu={setContextMenu}
          setPromptItem={setPromptItem}
          settings={settings}
        />
      </DndContext>
    );
  },
);

const DragOverlayWrapper: React.FC<{
  todoData: TodoData | null;
  filters: Filters | null;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: SettingStore;
}> = memo(({ todoData, filters, setTodoObject, setDialogOpen, setContextMenu, setPromptItem, settings }) => {
  const { active } = useDndContext();
  const activeId = active?.id as number | undefined;

  if (!activeId || !todoData) return null;

  let activeTodoObject: TodoObject | undefined;
  for (const group of todoData) {
    const found = group.todoObjects.find(obj => obj.lineNumber === activeId);
    if (found) {
      activeTodoObject = found;
      break;
    }
  }

  if (!activeTodoObject) return null;

  return (
    <DragOverlay>
      <Row
        todoObject={activeTodoObject}
        filters={filters}
        setTodoObject={setTodoObject}
        setDialogOpen={setDialogOpen}
        setContextMenu={setContextMenu}
        setPromptItem={setPromptItem}
        settings={settings}
        justDragged={false}
      />
    </DragOverlay>
  );
});

DragOverlayWrapper.displayName = "DragOverlayWrapper";

GridComponent.displayName = "GridComponent";

export default GridComponent;
