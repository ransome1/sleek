import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ListItem, Button, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownWideShort, faArrowUpShortWide, faBars } from '@fortawesome/free-solid-svg-icons';
import { attributeMapping } from './Shared';

export type DraggableListItemProps = {
  item: Item;
  index: number;
};

const DraggableListItem = ({ item, index, sorting, setSorting }: DraggableListItemProps) => {
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
          <Box><FontAwesomeIcon icon={faBars} /></Box>
          {attributeMapping[item.value]}
          <Button onClick={handleButtonClick}>
            {!item.invert && <FontAwesomeIcon icon={faArrowDownWideShort} />}
            {item.invert && <FontAwesomeIcon icon={faArrowUpShortWide} />}
          </Button>
          
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
