import React, { useState, useEffect } from 'react';
import DraggableListItem from './DraggableListItem';
import Box from '@mui/material/Box';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import './DraggableList.scss';

const { store } = window.api;

type DraggableListProps = {
  settings: Settings;
  attributeMapping: TranslatedAttributes;
};

const DraggableList: React.FC<DraggableListProps> = ({
  settings,
  attributeMapping,
}) => {
  const [accordionOrder, setAccordionOrder] = useState<Sorting[]>(settings.sorting);
  const reorder = (list: Sorting[], startIndex: number, endIndex: number): Sorting[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    if(!result.destination) return;
    const updatedSorting = reorder(settings.sorting, result.source.index, result.destination.index);
    setAccordionOrder(updatedSorting);
  };

  useEffect(() => {
    store.set('sorting', accordionOrder);
  }, [accordionOrder]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided: any) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {accordionOrder.map((item: Sorting, index: number) => (
              <DraggableListItem
                item={item}
                index={index}
                key={item.id}
                settings={settings}
                setAccordionOrder={setAccordionOrder}
                attributeMapping={attributeMapping}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
