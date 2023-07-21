import React from 'react';
import { List } from '@mui/material';
import DataGridRow from './DataGridRow';
import './DataGrid.scss';

const TodoDataGrid = ({ todoObjects, attributes, filters, setTodoObject }) => {

  if (!todoObjects || Object.keys(todoObjects).length === 0) {
    return null;
  }

  const rows = [];
  for (const [key, data] of Object.entries(todoObjects)) {
    const header = { group: true, key: key };
    const todos = data.filter(todo => todo.body.trim() !== '').map(todo => ({
      ...todo,
      id: todo.id,
      group: false,
    }));
    rows.push(header, ...todos);
  }

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

  return (
    <List id="dataGrid" data-testid="data-grid-component" onKeyUp={handleKeyUp}>
      {rows.map((row, index) => (
        <DataGridRow key={index} attributes={attributes} todoObject={row} filters={filters} setTodoObject={setTodoObject} />
      ))}
    </List>
  );
};

export default TodoDataGrid;
