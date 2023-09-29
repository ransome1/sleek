import React, { useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ListItem, Button, Box } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import './DraggableListItem.scss';

const store = window.api.store;

type DraggableListItem = {
  item: Item;
  index: number;
  settings: any;
  setSettings: any;
};

const DraggableListItem: React.FC<DraggableListItem> = ({ item, index, settings, setSettings, attributeMapping }) => {
  const handleButtonClick = () => {
    const updatedSorting = settings.sorting.map((sortingItem) => {
      if (sortingItem.id === item.id) {
        return { ...sortingItem, invert: !item.invert };
      }
      return sortingItem;
    });
    store.set('sorting', updatedSorting);
    setSettings((prevSettings) => ({
      ...prevSettings,
      sorting: updatedSorting,
    }));
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
            {!item.invert && <SortIcon className='invert' />}
            {item.invert && <SortIcon />}
          </Button>
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;