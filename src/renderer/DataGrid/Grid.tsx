import React, { useState, KeyboardEvent, memo } from 'react';
import { List } from '@mui/material';
import Row from './Row';
import { TodoObject, Attributes, Filters, ContextMenuItem, PromptItem } from '../../main/util';
import './Grid.scss';

interface TodoDataGridProps {
  todoObjects: TodoObject[] | null;
  attributes: Attributes | null;
  filters: Filters | null;
  setDialogOpen: (open: boolean) => void;
  setTextFieldValue: (value: string) => void;
  contextMenuPosition: { top: number; left: number } | null;
  setContextMenuPosition: (position: { top: number; left: number } | null) => void;
  contextMenuItems: ContextMenuItem[];
  setContextMenuItems: (items: any[]) => void;
  setTodoObject: (todoObject: TodoObject) => void;
  setPromptItem: PromptItem;
}

const TodoDataGrid: React.FC<TodoDataGridProps> = memo(({
   todoObjects,
   attributes,
   filters,
   setDialogOpen,
   setTextFieldValue,
   contextMenuPosition,
   setContextMenuPosition,
   contextMenuItems,
   setContextMenuItems,
   setTodoObject,
   setPromptItem,
 }) => {
  const [visibleRowCount, setVisibleRowCount] = useState(50);
  const [loadMoreRows, setLoadMoreRows] = useState(true);

  const handleKeyUp = (event: KeyboardEvent) => {
    if(event.key === 'ArrowDown') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex = Array.from(listItems).indexOf(document.activeElement);
      const nextIndex = currentIndex + 1;
      const nextElement = listItems[nextIndex];
      if(nextElement) {
        nextElement.focus();
      }
    } else if(event.key === 'ArrowUp') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex = Array.from(listItems).indexOf(document.activeElement);
      const prevIndex = currentIndex - 1;
      const prevElement = listItems[prevIndex];
      if(prevElement) {
        prevElement.focus();
      }
    } else if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if(!event.target.closest('li')) return;
      const rowItems = event.target.closest('li').querySelectorAll(
        'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const currentIndex = Array.from(rowItems).indexOf(document.activeElement);
      const nextIndex = event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
      const nextElement = rowItems[nextIndex];
      if(nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleScroll = () => {
    const list = document.getElementById('dataGrid');
    if(list && loadMoreRows) {
      const scrollPos = list.scrollTop;
      const totalHeight = list.scrollHeight;
      const clientHeight = list.clientHeight;
      if(totalHeight - scrollPos <= clientHeight * 3) {
        const remainingRows: TodoObject[] | null = todoObjects?.slice(visibleRowCount, visibleRowCount + 30);
        if(remainingRows?.length === 0) {
          setLoadMoreRows(false);
        } else {
          setVisibleRowCount((prevVisibleRowCount) => prevVisibleRowCount + 30);
        }
      }
    }
  };

  if(!todoObjects || Object.keys(todoObjects).length === 0) return null;

  const rows = todoObjects.slice(0, visibleRowCount);

  return (
    <List id="dataGrid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
      {rows.map((row, index) => (
        <Row
          key={index}
          attributes={attributes}
          row={row}
          setTodoObject={setTodoObject}
          filters={filters}
          setDialogOpen={setDialogOpen}
          setTextFieldValue={setTextFieldValue}
          contextMenuPosition={contextMenuPosition}
          setContextMenuPosition={setContextMenuPosition}
          contextMenuItems={contextMenuItems}
          setContextMenuItems={setContextMenuItems}
          setPromptItem={setPromptItem}
        />
      ))}
    </List>
  );
});

export default TodoDataGrid;
