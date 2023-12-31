import React, { KeyboardEvent, memo } from 'react';
import { List } from '@mui/material';
import Row from './Row';
import './Grid.scss';

interface TodoDataGridProps {
  todoObjects: TodoObject[] | null;
  attributes: Attributes | null;
  filters: Filters | null;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: Settings;
  visibleRowCount: number;
  setVisibleRowCount: React.Dispatch<React.SetStateAction<number>>;
  loadMoreRows: boolean;
  setLoadMoreRows: React.Dispatch<React.SetStateAction<boolean>>;
}

const TodoDataGrid: React.FC<TodoDataGridProps> = memo(({
  todoObjects,
  attributes,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
  visibleRowCount,
  setVisibleRowCount,
  loadMoreRows,
  setLoadMoreRows,
 }) => {

  const list = document.getElementById('dataGrid');
  const totalRowCount = todoObjects?.length || 0;

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
      const currentIndex: number = Array.from(listItems).indexOf(document.activeElement);
      const prevIndex: number = currentIndex - 1;
      const prevElement: Element = listItems[prevIndex];
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
    if(list && loadMoreRows) {      
      const scrollPos = list.scrollTop;
      const totalHeight = list.scrollHeight;
      const clientHeight = list.clientHeight;
      if(totalHeight - scrollPos <= clientHeight * 3) {
        if(visibleRowCount >= totalRowCount) {
          setLoadMoreRows(false);
        } else {
          setVisibleRowCount((prevVisibleRowCount) => prevVisibleRowCount + 30);
        }
      }
    }
  };

  const visibleTodoObjects = todoObjects?.slice(0, visibleRowCount);

  return (
    <List id="dataGrid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
      {visibleTodoObjects?.map((row, index) => (
        <Row
          key={index}
          todoObject={row}
          filters={filters}
          setTodoObject={setTodoObject}
          setDialogOpen={setDialogOpen}
          setContextMenu={setContextMenu}
          setPromptItem={setPromptItem}
          settings={settings}
        />
      ))}
    </List>
  );
});

export default TodoDataGrid;
