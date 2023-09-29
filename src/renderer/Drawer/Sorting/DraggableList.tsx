import React, { useState } from 'react';
import DraggableListItem from './DraggableListItem';
import { Box } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './DraggableList.scss';

const store = window.api.store;

interface Settings {
  sorting: string[];
}

const DraggableList = React.memo(({ attributeMapping }) => {
  const [settings, setSettings] = useState<Settings>({
    sorting: store.get('sorting'),
  });

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = ({ destination, source }) => {
    if (!destination) return;
    const updatedSorting = reorder(settings.sorting, source.index, destination.index);
    store.set('sorting', updatedSorting);
    setSettings((prevSettings) => ({
      ...prevSettings,
      sorting: updatedSorting,
    }));
  };  

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
          {settings.sorting.map((item, index) => (
            <DraggableListItem
              item={item}
              index={index}
              key={item.id}
              settings={settings}
              setSettings={setSettings}
              attributeMapping={attributeMapping}
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
