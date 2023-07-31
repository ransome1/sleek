import React from 'react';
import DraggableListItem from './DraggableListItem';
import { Box } from '@mui/material';
import { DragDropContext, Droppable, OnDragEndResponder} from 'react-beautiful-dnd';
import './DraggableList.scss';

const store = window.electron.store;
const sorting = store.get('sorting');

export type DraggableListProps = {
  items: Item[];
  onDragEnd: OnDragEndResponder;
};

const DraggableList = React.memo(({ sorting, setSorting, onDragEnd }: DraggableListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {provided => (
          <Box className='sorting' ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Sorting</h3>
            {sorting.map((sortingItem, index) => (
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
