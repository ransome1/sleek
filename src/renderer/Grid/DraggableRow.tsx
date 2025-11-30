import React, { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import Row from './Row'
import './DraggableRow.scss'

interface DraggableRowProps {
  id: string
  todoObject: TodoObject
  filters: Filters | null
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>
  settings: Settings
  handleButtonClick: (event: React.MouseEvent | React.KeyboardEvent) => void
}

const DraggableRow: React.FC<DraggableRowProps> = memo(({
  id,
  todoObject,
  filters,
  setDialogOpen,
  setTodoObject,
  setContextMenu,
  setPromptItem,
  settings,
  handleButtonClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-row ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" />
      </div>
      <div className="row-content">
        <Row
          todoObject={todoObject}
          filters={filters}
          setDialogOpen={setDialogOpen}
          setTodoObject={setTodoObject}
          setContextMenu={setContextMenu}
          setPromptItem={setPromptItem}
          settings={settings}
          handleButtonClick={handleButtonClick}
        />
      </div>
    </div>
  )
})

DraggableRow.displayName = 'DraggableRow'

export default DraggableRow
