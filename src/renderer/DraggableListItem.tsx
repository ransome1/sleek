import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ListItem, Button, Box } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { attributeMapping } from './Shared';
import './DraggableListItem.scss';

export type DraggableListItemProps = {
  item: Item;
  index: number;
};

const DraggableListItem = ({ 
  item,
  index,
  sorting,
  setSorting
}: DraggableListItemProps) => {
  const handleButtonClick = () => {
    const updatedSorting = sorting.map(sortingItem => {
      if (sortingItem.id === item.id) {
        return { ...sortingItem, invert: !item.invert };
      }
      return sortingItem;
    });
    setSorting(updatedSorting);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? 'draggingListItem' : ''}
        >
          <Box><DragHandleIcon /></Box>
          {attributeMapping[item.value]}
          <Button onClick={handleButtonClick}>
            {!item.invert && <SortIcon />}
            {item.invert && <SortIcon className='invert' />}
          </Button>
          
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
