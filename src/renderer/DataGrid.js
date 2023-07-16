import React from 'react';
import { List } from '@mui/material';
import DataGridRow from './DataGridRow';
import './DataGrid.scss';

const TodoDataGrid = ({ todoObjects, attributes, filters }) => {
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

  return (
    <List id="dataGrid" data-testid="data-grid-component">
      {rows.map((row, index) => (
        <DataGridRow key={index} attributes={attributes} todoObject={row} filters={filters} />
      ))}
    </List>
  );
};

export default TodoDataGrid;
