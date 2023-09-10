import React from 'react';
import DraggableListItem from './DraggableListItem';
import { Box } from '@mui/material';
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import './DraggableList.scss';

const store = window.electron.store;

export type DraggableListProps = {
  items: Item[];
  onDragEnd: OnDragEndResponder;
  sorting: Sorting[]; // You might need to import or define the Sorting type
  setSorting: (sorting: Sorting[]) => void; // You might need to define this function type
  disabled?: boolean;
};

const DraggableList = React.memo(({ sorting, setSorting, onDragEnd, disabled }: DraggableListProps) => {
  return (
    <DragDropContext onDragEnd={disabled ? undefined : onDragEnd}>
      <Droppable droppableId="droppable-list">
        {provided => (
          <Box ref={provided.innerRef} {...provided.droppableProps} className={disabled ? 'disabled' : ''}>
            {!disabled &&
              sorting.map((sortingItem, index) => (
                <DraggableListItem
                  item={sortingItem}
                  index={index}
                  key={sortingItem.id}
                  sorting={sorting}
                  setSorting={setSorting}
                />
              ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
});

export default DraggableList;
  