import React, { memo, ReactElement, ReactNode, useState, useCallback, useRef } from "react";
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

const findItemLocation = (data: TodoData, lineNumber: number) => {
  for (let i = 0; i < data.length; i++) {
    const idx = data[i].todoObjects.findIndex((obj) => obj.lineNumber === lineNumber);
    if (idx !== -1) {
      return { groupIndex: i, itemIndex: idx, todoObject: data[i].todoObjects[idx] };
    }
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
    const [activeId, setActiveId] = useState<number | null>(null);

    const todoDataRef = useRef(todoData);
    todoDataRef.current = todoData;
    const originalTodoDataRef = useRef<TodoData | null>(null);
    const originalGroupRef = useRef<string | null>(null);
    const activeTodoObjectRef = useRef<TodoObject | null>(null);

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

      const activeId = active.id as number;
      const overId = over.id as number;

      setTodoData((prev) => {
        if (!prev) return prev;

        const activeLoc = findItemLocation(prev, activeId);
        const overLoc = findItemLocation(prev, overId);

        if (!activeLoc || !overLoc) return prev;

        if (activeLoc.groupIndex === overLoc.groupIndex) {
          const group = prev[activeLoc.groupIndex];
          if (activeLoc.itemIndex === overLoc.itemIndex) return prev;

          const newTodoData = [...prev];
          newTodoData[activeLoc.groupIndex] = {
            ...group,
            todoObjects: arrayMove(
              group.todoObjects,
              activeLoc.itemIndex,
              overLoc.itemIndex,
            ),
          };
          return newTodoData;
        }

        const newData = prev.map((g) => ({ ...g, todoObjects: [...g.todoObjects] }));

        const [movedItem] = newData[activeLoc.groupIndex].todoObjects.splice(
          activeLoc.itemIndex,
          1,
        );

        let insertIndex = overLoc.itemIndex;

        const activeRect =
          (active as any).rect?.current?.translated || (active as any).rect;
        const overRect = (over as any).rect?.current?.translated || (over as any).rect;

        if (activeRect && overRect) {
          const activeCenter = activeRect.top + activeRect.height / 2;
          const overCenter = overRect.top + overRect.height / 2;
          if (activeCenter > overCenter + 2) {
            insertIndex = overLoc.itemIndex + 1;
          }
        }

        newData[overLoc.groupIndex].todoObjects.splice(insertIndex, 0, movedItem);

        return newData;
      });
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

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
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

        if (originalGroupRef.current !== currentGroupTitle) {
          const targetGroup = currentTodoData[activeLoc.groupIndex];
          const sortKey = sortKeyValueRef.current;
          let attributeChange: { type: string; value: string } | null = null;

          if (targetGroup.todoObjects.length > 1) {
            const overTodoObject = targetGroup.todoObjects.find(
              (obj) => obj.lineNumber !== activeId,
            );
            if (overTodoObject) {
              attributeChange = getAttributeChangeForGroup(
                activeLoc.todoObject,
                overTodoObject,
                sortKey,
              );
            }
          } else if (targetGroup.todoObjects.length === 1) {
            const title = targetGroup.title;
            if (sortKey === "priority") {
              const value = title ?? "-";
              if (activeLoc.todoObject.priority !== value) {
                attributeChange = { type: "priority", value: String(value) };
              }
            } else if (sortKey === "due") {
              const value = title ?? "";
              if (activeLoc.todoObject.due !== value) {
                attributeChange = { type: "due", value: String(value) };
              }
            } else if (sortKey === "projects" && title) {
              const value = String(title);
              if (!activeLoc.todoObject.projects?.includes(value)) {
                attributeChange = { type: "projects", value };
              }
            } else if (sortKey === "contexts" && title) {
              const value = String(title);
              if (!activeLoc.todoObject.contexts?.includes(value)) {
                attributeChange = { type: "contexts", value };
              }
            }
          }

          if (attributeChange) {
            let toLineNumber: number;

            if (targetGroup.todoObjects.length === 1) {
              toLineNumber = activeId;
            } else if (activeLoc.itemIndex < targetGroup.todoObjects.length - 1) {
              const targetLine = targetGroup.todoObjects[activeLoc.itemIndex + 1].lineNumber;
              toLineNumber = targetLine > activeId ? targetLine - 1 : targetLine;
            } else {
              const beforeLine = targetGroup.todoObjects[activeLoc.itemIndex - 1].lineNumber;
              toLineNumber = beforeLine >= activeId ? beforeLine : beforeLine + 1;
            }

            ipcRenderer.send(
              "moveTodoLine",
              activeId,
              toLineNumber,
              attributeChange.type,
              attributeChange.value,
            );
          }

          originalTodoDataRef.current = null;
          originalGroupRef.current = null;
          activeTodoObjectRef.current = null;
          return;
        }

        const { over } = event;
        if (!over || activeId === over.id) {
          originalTodoDataRef.current = null;
          originalGroupRef.current = null;
          activeTodoObjectRef.current = null;
          return;
        }

        const overLineNumber = over.id as number;

        setTodoData((prev) => {
          if (!prev) return prev;

          const group = prev[activeLoc.groupIndex];
          const oldIndex = activeLoc.itemIndex;
          const newIndex = group.todoObjects.findIndex(
            (obj) => obj.lineNumber === overLineNumber,
          );

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newTodoData = [...prev];
            newTodoData[activeLoc.groupIndex] = {
              ...group,
              todoObjects: arrayMove(group.todoObjects, oldIndex, newIndex),
            };
            return newTodoData;
          }
          return prev;
        });

        const toLineNumber = overLineNumber > activeId ? overLineNumber - 1 : overLineNumber;
        ipcRenderer.send("reorderTodoLines", activeId, toLineNumber);

        originalTodoDataRef.current = null;
        originalGroupRef.current = null;
        activeTodoObjectRef.current = null;
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
                  <div className={`group-spacer${activeId != null ? " active" : ""}`} />
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
                            activeId={activeId}
                          />,
                        );
                      }
                      return rows;
                    })()}
                  </SortableContext>
                  <div className={`group-spacer${activeId != null ? " active" : ""}`} />
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
}

const DragOverlayWrapper: React.FC<DragOverlayWrapperProps> = memo(({ activeTodoObject, todoData, filters, setTodoObject, setDialogOpen, setContextMenu, setPromptItem, settings }) => {
  const { active } = useDndContext();
  const activeId = active?.id as number | undefined;

  if (activeId == null || !todoData) return null;

  let resolvedTodoObject = activeTodoObject;
  if (!resolvedTodoObject) {
    for (const group of todoData) {
      const found = group.todoObjects.find(obj => obj.lineNumber === activeId);
      if (found) {
        resolvedTodoObject = found;
        break;
      }
    }
  }

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
        justDragged={false}
      />
    </DragOverlay>
  );
});

DragOverlayWrapper.displayName = "DragOverlayWrapper";

GridComponent.displayName = "GridComponent";

export default GridComponent;
