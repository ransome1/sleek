import React, { useState } from 'react';
import { List } from '@mui/material';
import DataGridRow from './DataGridRow';
import './DataGrid.scss';

const TodoDataGrid = ({ todoObjects, attributes, filters, setDialogOpen, setTextFieldValue, setTodoObject }) => { 
  const [visibleRowCount, setVisibleRowCount] = useState(50);
  const [loadMoreRows, setLoadMoreRows] = useState(true);

  const handleKeyUp = (event) => {
    if (event.key === 'ArrowDown') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex = Array.from(listItems).indexOf(document.activeElement);
      const nextIndex = currentIndex + 1;
      const nextElement = listItems[nextIndex];

      if (nextElement) {
        nextElement.focus();
      }
    } else if (event.key === 'ArrowUp') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex = Array.from(listItems).indexOf(document.activeElement);
      const prevIndex = currentIndex - 1;
      const prevElement = listItems[prevIndex];

      if (prevElement) {
        prevElement.focus();
      }
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if(!event.target.closest('li')) return;
      const rowItems = event.target.closest('li').querySelectorAll('button, input, select, a[href], [tabindex]:not([tabindex="-1"])');
      const currentIndex = Array.from(rowItems).indexOf(document.activeElement);
      const nextIndex = event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
      const nextElement = rowItems[nextIndex];

      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleScroll = () => {
    const list = document.getElementById('dataGrid');
    if (list && loadMoreRows) {
      const scrollPos = list.scrollTop;
      const totalHeight = list.scrollHeight;
      const clientHeight = list.clientHeight;

      if (totalHeight - scrollPos <= clientHeight * 2) {
        const remainingRows = todoObjects.slice(visibleRowCount, visibleRowCount + 20);
        if (remainingRows.length === 0) {
          setLoadMoreRows(false);
        } else {
          setVisibleRowCount(prevVisibleRowCount => prevVisibleRowCount + 20);
        }
      }
    }
  };

  if (!todoObjects || Object.keys(todoObjects).length === 0) return null;

  const visibleRows = todoObjects.slice(0, visibleRowCount);

  return (
    <List id="dataGrid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
      {visibleRows.map((row, index) => (  
        <DataGridRow 
          key={index}
          attributes={attributes}
          todoObject={row}
          filters={filters}
          setDialogOpen={setDialogOpen}
          setTextFieldValue={setTextFieldValue}
          setTodoObject={setTodoObject}
        />
      ))}
    </List>
  );
};

export default TodoDataGrid;