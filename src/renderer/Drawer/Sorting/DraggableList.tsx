import React, { useState, useEffect } from 'react';
import DraggableListItem from './DraggableListItem';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import './DraggableList.scss';

const { store } = window.api;

type DraggableListProps = {
  settings: Settings;
};

const DraggableList: React.FC<DraggableListProps> = ({
  settings,
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
    store.setConfig('sorting', accordionOrder);
  }, [accordionOrder]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided: any) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {accordionOrder.map((item: Sorting, index: number) => (
              <DraggableListItem
                item={item}
                index={index}
                key={item.id}
                settings={settings}
                setAccordionOrder={setAccordionOrder}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableList;
