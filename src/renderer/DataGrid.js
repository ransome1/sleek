import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import { DataGridRow } from './DataGridRow.js';
import { List } from '@mui/material';
import './DataGrid.scss';

const TodoTxtDataGrid = ({ todoTxtObjects, searchString }) => {
  if (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0) {
    return null;
  }

  const rows = todoTxtObjects
    ? Object.entries(todoTxtObjects).reduce((acc, [key, data]) => {
        const header = { id: key, body: key, group: true };
        let todos = data.filter(todo => todo.body.trim() !== '');

        if (searchString) {
          todos = todos.filter(todo => todo.string.toLowerCase().includes(searchString));
        }

        todos = todos.map(todo => ({ ...todo, id: todo.id.toString() }));

        if (todos.length > 0) {
          return [...acc, header, ...todos];
        } else {
          return acc;
        }
      }, [])
    : []; 

  return (
    <List className="todoTxtGrid" data-testid="data-grid-component">
      {rows.map(row => (
        <DataGridRow key={row.id} rowData={row} />
      ))}
    </List>
  );
};

export default TodoTxtDataGrid;
