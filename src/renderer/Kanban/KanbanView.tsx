import React, { useState, useEffect } from 'react'
import { IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { DateTime } from 'luxon'
import './KanbanView.scss'

const { ipcRenderer } = window.api

interface KanbanViewProps {
  todoData: TodoData
  filters: Filters | null
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
}

interface KanbanColumn {
  id: string
  title: string
  todos: TodoObject[]
}

const KanbanView: React.FC<KanbanViewProps> = ({
  todoData,
  filters,
  setTodoObject,
  setDialogOpen,
  setContextMenu,
  setPromptItem,
  settings
}) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [draggedTodo, setDraggedTodo] = useState<TodoObject | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)
  const [dropBeforeTodo, setDropBeforeTodo] = useState<TodoObject | null>(null)

  useEffect(() => {
    if (!todoData) return

    const now = DateTime.now()
    const sevenDaysFromNow = now.plus({ days: 7 })

    const backlog: TodoObject[] = []
    const thisWeek: TodoObject[] = []
    const inProgress: TodoObject[] = []
    const done: TodoObject[] = []

    // Flatten all todos from all groups
    const allTodos: TodoObject[] = []
    todoData.forEach((group) => {
      if (group.todoObjects) {
        allTodos.push(...group.todoObjects)
      }
    })

    allTodos.forEach((todo) => {
      if (todo.complete) {
        done.push(todo)
      } else if (todo.string.includes('wip:1')) {
        inProgress.push(todo)
      } else if (todo.due) {
        const dueDate = DateTime.fromISO(todo.due)
        if (dueDate <= sevenDaysFromNow) {
          thisWeek.push(todo)
        } else {
          backlog.push(todo)
        }
      } else {
        backlog.push(todo)
      }
    })

    // Sort each column by priority
    const sortByPriority = (a: TodoObject, b: TodoObject) => {
      if (!a.priority && !b.priority) return 0
      if (!a.priority) return 1
      if (!b.priority) return -1
      return a.priority.localeCompare(b.priority)
    }

    setColumns([
      { id: 'backlog', title: 'Backlog', todos: backlog.sort(sortByPriority) },
      { id: 'thisWeek', title: 'This Week', todos: thisWeek.sort(sortByPriority) },
      { id: 'inProgress', title: 'In Progress', todos: inProgress.sort(sortByPriority) },
      { id: 'done', title: 'Done', todos: done.sort(sortByPriority) }
    ])
  }, [todoData])

  const handleTodoClick = (todo: TodoObject) => {
    setTodoObject(todo)
    setDialogOpen(true)
  }

  const handleAddNewTodo = (columnId: string) => {
    const now = new Date()
    let todoString = ''

    if (columnId === 'thisWeek') {
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const dueDate = threeDaysFromNow.toISOString().split('T')[0]
      todoString = `due:${dueDate}`
    } else if (columnId === 'inProgress') {
      todoString = 'wip:1'
    }

    const newTodo: TodoObject = {
      lineNumber: -1,
      body: todoString,
      string: todoString,
      complete: false,
      created: null,
      completed: null,
      priority: null,
      contexts: null,
      projects: null,
      due: null,
      dueString: null,
      notify: false,
      t: null,
      tString: null,
      rec: null,
      hidden: false,
      pm: null
    }

    setTodoObject(newTodo)
    setDialogOpen(true)
  }

  const handleDragStart = (todo: TodoObject, columnId: string) => {
    setDraggedTodo(todo)
    setDraggedFromColumn(columnId)
  }

  const handleDragOver = (e: React.DragEvent, todo: TodoObject | null) => {
    e.preventDefault()
    setDropBeforeTodo(todo)
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string, targetTodo: TodoObject | null) => {
    e.preventDefault()

    if (!draggedTodo || !draggedFromColumn) return

    if (draggedFromColumn === targetColumnId && targetTodo) {
      // Reorder within same column
      handleReorder(draggedTodo, targetTodo)
    } else if (draggedFromColumn !== targetColumnId) {
      // Move between columns
      handleMove(draggedTodo, targetColumnId)
    }

    setDraggedTodo(null)
    setDraggedFromColumn(null)
    setDropBeforeTodo(null)
  }

  const handleMove = (todo: TodoObject, targetColumnId: string) => {
    const now = DateTime.now()
    let updatedString = todo.string

    // Remove wip:1 tag
    updatedString = updatedString.replace(/\s*wip:1\s*/g, ' ').trim()

    // Update due date based on target column
    const currentDueMatch = updatedString.match(/due:(\d{4}-\d{2}-\d{2})/)
    const currentDueDate = currentDueMatch ? currentDueMatch[1] : null

    if (targetColumnId === 'thisWeek') {
      const threeDaysFromNow = now.plus({ days: 3 })
      const newDueDate = threeDaysFromNow.toISODate()
      if (currentDueDate) {
        updatedString = updatedString.replace(/due:\d{4}-\d{2}-\d{2}/, `due:${newDueDate}`)
      } else {
        updatedString = `${updatedString} due:${newDueDate}`.trim()
      }
    } else if (targetColumnId === 'inProgress') {
      updatedString = `${updatedString} wip:1`.trim()
    } else if (targetColumnId === 'backlog') {
      updatedString = updatedString.replace(/\s*due:\d{4}-\d{2}-\d{2}\s*/g, ' ').trim()
    } else if (targetColumnId === 'done') {
      // Mark as complete
      if (!todo.complete) {
        ipcRenderer.send('writeTodoToFile', todo.lineNumber, todo.string, true)
        return
      }
    }

    // Write the updated string - priority is already in the string, so it's preserved
    if (updatedString !== todo.string) {
      ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString)
    }
  }

  const handleReorder = (draggedTodo: TodoObject, targetTodo: TodoObject) => {
    const draggedPriority = draggedTodo.priority || 'Z'
    const targetPriority = targetTodo.priority || 'Z'

    const draggedCode = draggedPriority.charCodeAt(0)
    const targetCode = targetPriority.charCodeAt(0)

    let newPriority: string | null = null

    if (draggedCode >= targetCode) {
      // Dragging up - increase priority (lower letter)
      const newCode = Math.max(65, targetCode - 1) // 65 is 'A'
      newPriority = String.fromCharCode(newCode)
    }

    if (newPriority && newPriority !== draggedTodo.priority) {
      // Update the todo string with new priority
      let updatedString = draggedTodo.string
      // Remove old priority if exists
      updatedString = updatedString.replace(/^\([A-Z]\)\s*/, '')
      // Add new priority
      updatedString = `(${newPriority}) ${updatedString}`
      ipcRenderer.send('writeTodoToFile', draggedTodo.lineNumber, updatedString)
    }
  }

  const handleContextMenu = (event: React.MouseEvent, todo: TodoObject) => {
    event.preventDefault()
    event.stopPropagation()

    setContextMenu({
      event: event,
      items: [
        {
          id: 'edit',
          label: 'Edit',
          function: () => {
            setTodoObject(todo)
            setDialogOpen(true)
            setContextMenu(null)
          }
        },
        {
          id: 'complete',
          label: todo.complete ? 'Mark Incomplete' : 'Mark Complete',
          function: () => {
            ipcRenderer.send('writeTodoToFile', todo.lineNumber, todo.string, !todo.complete, false)
            setContextMenu(null)
          }
        },
        {
          id: 'priority-a',
          label: 'Priority A',
          function: () => {
            let updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
            updatedString = `(A) ${updatedString}`
            ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString, todo.complete, false)
            setContextMenu(null)
          }
        },
        {
          id: 'priority-b',
          label: 'Priority B',
          function: () => {
            let updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
            updatedString = `(B) ${updatedString}`
            ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString, todo.complete, false)
            setContextMenu(null)
          }
        },
        {
          id: 'priority-c',
          label: 'Priority C',
          function: () => {
            let updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
            updatedString = `(C) ${updatedString}`
            ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString, todo.complete, false)
            setContextMenu(null)
          }
        },
        {
          id: 'remove-priority',
          label: 'Remove Priority',
          function: () => {
            const updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
            ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString, todo.complete, false)
            setContextMenu(null)
          }
        },
        {
          id: 'delete',
          label: 'Delete',
          promptItem: {
            id: 'delete',
            headline: 'Delete todo?',
            text: `Delete: <code>${todo.body || todo.string}</code>`,
            button1: 'Delete',
            onButton1: () => {
              ipcRenderer.send('removeLineFromFile', todo.lineNumber)
              setPromptItem(null)
            }
          }
        }
      ]
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleToggleComplete = (todo: TodoObject) => {
    ipcRenderer.send('writeTodoToFile', todo.lineNumber, todo.string, !todo.complete, false)
    handleCloseContextMenu()
  }

  const handleDeleteTodo = (todo: TodoObject) => {
    setPromptItem({
      headline: 'Delete todo?',
      body: todo.body || todo.string,
      acceptFunction: () => {
        ipcRenderer.send('removeLineFromFile', todo.lineNumber)
        setPromptItem(null)
      },
      declineFunction: () => setPromptItem(null)
    })
    handleCloseContextMenu()
  }

  const handleChangePriority = (todo: TodoObject, priority: string) => {
    let updatedString = todo.string.replace(/^\([A-Z]\)\s*/, '')
    if (priority) {
      updatedString = `(${priority}) ${updatedString}`
    }
    ipcRenderer.send('writeTodoToFile', todo.lineNumber, updatedString, todo.complete, false)
    handleCloseContextMenu()
  }

  const getPriorityColor = (priority: string | null): string => {
    if (!priority) return 'default'
    const priorityLetter = priority.toUpperCase()
    if (priorityLetter <= 'C') return 'error'
    if (priorityLetter <= 'F') return 'warning'
    return 'default'
  }

  return (
    <div className="kanban-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px', height: '100%', overflow: 'auto', background: '#f5f5f5' }}>
      {columns.map((column) => (
        <div
          key={column.id}
          className="kanban-column"
          style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', minHeight: '200px', border: '1px solid #ddd' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, column.id, null)}
        >
          <div className="kanban-column-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
            <h3 style={{ margin: 0, flex: 1, fontSize: '16px', fontWeight: 600 }}>{column.title}</h3>
            <span className="todo-count" style={{ fontSize: '14px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>{column.todos.length}</span>
            <IconButton
              size="small"
              onClick={() => handleAddNewTodo(column.id)}
              title="Add new todo"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="kanban-column-content" style={{ flex: 1, overflowY: 'auto', padding: '8px', minHeight: '200px' }}>
            {column.todos.map((todo) => (
              <div
                key={todo.lineNumber}
                className={`kanban-card ${dropBeforeTodo?.lineNumber === todo.lineNumber ? 'drag-over' : ''}`}
                draggable
                onDragStart={() => handleDragStart(todo, column.id)}
                onDragOver={(e) => handleDragOver(e, todo)}
                onDrop={(e) => handleDrop(e, column.id, todo)}
                onClick={() => handleTodoClick(todo)}
                onContextMenu={(e) => handleContextMenu(e, todo)}
              >
                {todo.priority && (
                  <span className={`priority priority-${getPriorityColor(todo.priority)}`}>
                    ({todo.priority})
                  </span>
                )}
                <div className="todo-body">{todo.body}</div>
                {todo.due && <div className="todo-due">Due: {todo.dueString}</div>}
                {todo.projects && todo.projects.length > 0 && (
                  <div className="todo-projects">{todo.projects.map((p) => (
                      <span key={p} className="project-tag">+{p}</span>
                    ))}
                  </div>
                )}
                {todo.contexts && todo.contexts.length > 0 && (
                  <div className="todo-contexts">{todo.contexts.map((c) => (
                      <span key={c} className="context-tag">@{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanView
