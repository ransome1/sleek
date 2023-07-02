import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import { DataGridRow } from './DataGridRow.js';
import { List, Box, Chip } from '@mui/material';
import './DataGrid.scss';

const TodoTxtDataGrid = ({ todoTxtObjects, searchString }) => {
  if (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0) {
    return null;
  }

  let availableRows = 0;
  let visibleRows = 0;

  const rows = todoTxtObjects
    ? Object.entries(todoTxtObjects).reduce((acc, [key, data]) => {
        const header = { id: key, body: key, group: true };
        let todos = data.filter(todo => todo.body.trim() !== '');
        todos = todos.map(todo => ({ ...todo, id: todo.id, group: false }));
        availableRows += todos.length;
        if(searchString) todos = todos.filter(todo => todo.string.toLowerCase().includes(searchString.toLowerCase()));
        visibleRows += todos.length;
        if (todos.length > 0) {
          return [...acc, header, ...todos];
        } else {
          return acc;
        }
      }, [])
    : [];

  const label = "Showing " + visibleRows + " of " + availableRows;

  return (
    <Box className="todoTxtGrid">
      {availableRows > 0 && (
        <Box className="todoCounter">
          <Chip label={label} variant="outlined" />
        </Box>
      )}
      <List data-testid="data-grid-component">
        {rows.map(row => (
          <DataGridRow key={row.id} rowData={row} />
        ))}
      </List>
    </Box>
  );
};

export default TodoTxtDataGrid;
