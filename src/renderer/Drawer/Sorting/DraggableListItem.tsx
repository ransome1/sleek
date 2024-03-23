import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import SortIcon from '@mui/icons-material/Sort';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { withTranslation } from 'react-i18next';
import { i18n } from '../../Settings/LanguageSelector';
import { translatedAttributes } from '../../Shared';
import './DraggableListItem.scss';

type DraggableListItemProps = {
  item: Sorting;
  index: number;
  settings: Settings;
  setAccordionOrder: React.Dispatch<React.SetStateAction<Sorting[]>>;
  t: typeof i18n.t;
};

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  item,
  index,
  settings,
  setAccordionOrder,
  t,
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

  const attributeHeadline: string = translatedAttributes(t)[item.value];

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
          <div><DragHandleIcon /></div>
          {attributeHeadline}
          <Button onClick={handleButtonClick} data-testid={`drawer-sorting-draggable-list-item-${item.value}-invert`}>
            {!item.invert && <SortIcon className='invert' />}
            {item.invert && <SortIcon />}
          </Button>
        </ListItem>
      )}
    </Draggable>
  );
};

export default withTranslation()(DraggableListItem);
