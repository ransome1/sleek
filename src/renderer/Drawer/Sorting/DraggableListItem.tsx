import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ListItem, Button, Box } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import './DraggableListItem.scss';

type DraggableListItemProps = {
  item: Sorting;
  index: number;
  settings: Settings;
  attributeMapping: TranslatedAttributes;
  setAccordionOrder: React.Dispatch<React.SetStateAction<Sorting[]>>;
};

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  item,
  index,
  settings,
  attributeMapping,
  setAccordionOrder,
}) => {
  const updatedSorting = settings.sorting.map((sortingItem: Sorting) => {
    if(sortingItem.id === item.id) {
      return { ...sortingItem, invert: !item.invert };
    }
    return sortingItem;
  });
  const handleButtonClick = () => {
    setAccordionOrder(updatedSorting);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? 'draggingListItem' : ''}
          data-testid={`drawer-sorting-draggable-list-item-${item.value}`}
        >
          <Box><DragHandleIcon /></Box>
          {attributeMapping[item.value]}
          <Button onClick={handleButtonClick} data-testid={`drawer-sorting-draggable-list-item-${item.value}-invert`}>
            {!item.invert && <SortIcon className='invert' />}
            {item.invert && <SortIcon />}
          </Button>
        </ListItem>
      )}
    </Draggable>
  );
};

export default DraggableListItem;
