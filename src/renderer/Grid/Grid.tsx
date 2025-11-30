import React, { KeyboardEvent, memo, useState, useCallback } from 'react'
import List from '@mui/material/List'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'
import Row from './Row'
import DraggableRow from './DraggableRow'
import Group from './Group'
import { HandleFilterSelect } from '../Shared'
import './Grid.scss'

const { ipcRenderer } = window.api

interface GridComponentProps {
  todoData: TodoData | null
  filters: Filters | null
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
  headers: Headers
  searchString: string
  selectedTodos?: number[]
  setSelectedTodos?: React.Dispatch<React.SetStateAction<number[]>>
  batchMode?: boolean
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
    selectedTodos = [],
    setSelectedTodos,
    batchMode = false,
  }) => {
    const { t } = useTranslation()
    const renderedRows: number[] = []
    const list = document.getElementById('grid')
    const [loadMoreRows, setLoadMoreRows] = useState(false)
    const [maxRows, setMaxRows] = useState(Math.floor(window.innerHeight / 35) * 2)
    const [draggedTodo, setDraggedTodo] = useState<{ todo: TodoObject; targetPriority: string | null } | null>(null)

    // DnD sensors configuration
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    )

    // Handle drag end - detect priority zone changes
    const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) return

      // Find the dragged todo and the target todo
      let draggedTodoObj: TodoObject | null = null
      let targetTodoObj: TodoObject | null = null

      todoData?.forEach((group) => {
        group.todoObjects.forEach((todo) => {
          if (`todo-${todo.lineNumber}` === active.id) {
            draggedTodoObj = todo
          }
          if (`todo-${todo.lineNumber}` === over.id) {
            targetTodoObj = todo
          }
        })
      })

      if (draggedTodoObj && targetTodoObj) {
        // If moving to a different priority group, prompt for priority change
        if (draggedTodoObj.priority !== targetTodoObj.priority && targetTodoObj.priority) {
          setPromptItem({
            id: 'changePriority',
            headline: t('dragDrop.changePriority.headline'),
            text: `${t('dragDrop.changePriority.text')} <strong>(${targetTodoObj.priority})</strong>?<br/><code>${draggedTodoObj.string}</code>`,
            button1: t('dragDrop.changePriority.confirm'),
            onButton1: () => {
              // Update priority in the todo string
              const newString = draggedTodoObj!.priority
                ? draggedTodoObj!.string.replace(`(${draggedTodoObj!.priority})`, `(${targetTodoObj!.priority})`)
                : `(${targetTodoObj!.priority}) ${draggedTodoObj!.string}`
              ipcRenderer.send('writeTodoToFile', draggedTodoObj!.lineNumber, newString, false, false)
            },
            button2: t('dragDrop.changePriority.keep'),
            onButton2: () => {
              // Just reorder without changing priority
              ipcRenderer.send('reorderTodo', draggedTodoObj!.lineNumber, targetTodoObj!.lineNumber)
            }
          })
        } else {
          // Same priority - just reorder
          ipcRenderer.send('reorderTodo', draggedTodoObj.lineNumber, targetTodoObj.lineNumber)
        }
      }
    }, [todoData, setPromptItem, t])

    // Handle button click (for batch selection)
    const handleButtonClick = useCallback((event: React.MouseEvent | React.KeyboardEvent, lineNumber: number) => {
      if (batchMode && setSelectedTodos) {
        event.preventDefault()
        event.stopPropagation()
        setSelectedTodos(prev => {
          if (prev.includes(lineNumber)) {
            return prev.filter(n => n !== lineNumber)
          }
          return [...prev, lineNumber]
        })
      }
    }, [batchMode, setSelectedTodos])

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowDown') {
        const listItems = document.querySelectorAll('li:not(.group)')
        const currentIndex = Array.from(listItems).indexOf(document.activeElement)
        const nextIndex = currentIndex + 1
        const nextElement = listItems[nextIndex]
        if (nextElement) {
          nextElement.focus()
        }
      } else if (event.key === 'ArrowUp') {
        const listItems = document.querySelectorAll('li:not(.group)')
        const currentIndex: number = Array.from(listItems).indexOf(document.activeElement)
        const prevIndex: number = currentIndex - 1
        const prevElement: Element = listItems[prevIndex]
        if (prevElement) {
          prevElement.focus()
        }
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (!event.target.closest('li')) return
        const rowItems = event.target
          .closest('li')
          .querySelectorAll('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')
        const currentIndex = Array.from(rowItems).indexOf(document.activeElement)
        const nextIndex = event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1
        const nextElement = rowItems[nextIndex]
        if (nextElement) {
          nextElement.focus()
        }
      }
    }

    const handleScroll = (): void => {
      if (list) {
        const a: number = list.scrollTop
        const b: number = list.scrollHeight - list.clientHeight
        const c: number = a / b

        if (c >= 0.85 && renderedRows.length < headers.availableObjects) {
          setLoadMoreRows(true)
        }

        if (loadMoreRows) {
          setLoadMoreRows(false)
          setMaxRows((maxRows) => maxRows + 30)
          ipcRenderer.send('requestData', searchString)
        }
      }
    }

    if (headers.visibleObjects === 0) return null

    // Collect all sortable IDs for the context
    const allSortableIds: string[] = []
    todoData?.forEach((group) => {
      if (group.visible) {
        group.todoObjects.forEach((todo) => {
          allSortableIds.push(`todo-${todo.lineNumber}`)
        })
      }
    })

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
          <List id="grid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
            {todoData?.map((group) => {
              if (!group.visible) {
                return null
              }
              return (
                <React.Fragment key={group.title}>
                  <Group
                    attributeKey={settings.sorting[0].value}
                    value={group.title}
                    filters={filters}
                  />
                  {((): JSX.Element[] => {
                    const rows: JSX.Element[] = []
                    for (let i = 0; i < group.todoObjects.length; i++) {
                      const todoObject = group.todoObjects[i]

                      if (renderedRows.length >= maxRows) {
                        break
                      } else if (renderedRows.includes(todoObject.lineNumber)) {
                        continue
                      }

                      renderedRows.push(todoObject.lineNumber)

                      rows.push(
                        <DraggableRow
                          key={todoObject.lineNumber}
                          id={`todo-${todoObject.lineNumber}`}
                          todoObject={todoObject}
                          filters={filters}
                          setTodoObject={setTodoObject}
                          setDialogOpen={setDialogOpen}
                          setContextMenu={setContextMenu}
                          setPromptItem={setPromptItem}
                          settings={settings}
                          handleButtonClick={(e) => handleButtonClick(e, todoObject.lineNumber)}
                        />
                      )
                    }
                    return rows
                  })()}
                </React.Fragment>
              )
            })}
          </List>
        </SortableContext>
      </DndContext>
    )
  }
)

GridComponent.displayName = 'GridComponent'

export default GridComponent
