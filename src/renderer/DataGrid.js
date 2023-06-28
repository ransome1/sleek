import React, { useEffect, useState } from 'react';
import { DataGridRow } from './DataGridRow.js';
import { List, AutoSizer } from 'react-virtualized';
import Box from '@mui/material/Box';
import './DataGrid.css';

const TodoTxtDataGrid = ( { todoTxtObjects } ) => {

  if (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0) {
    return null;
  }  

  const rowRenderer = ({ index, key, style }) => {
    const rowData = rows[index];
    if (rowData.group) {
      return (
        <div key={key} style={style}>
          {rowData.body}
        </div>
      );
    } else {
      return (
        <div key={key} style={style}>
          <DataGridRow rowData={rowData} />
        </div>
      );
    }
  };

  const rows = todoTxtObjects
    ? Object.entries(todoTxtObjects).reduce((acc, [key, data]) => {
        const header = { id: key, body: key, group: true };
        const todos = data
          .filter(todo => todo.body.trim() !== '')
          .map(todo => ({ ...todo, id: todo.id.toString() }));
        return [...acc, header, ...todos];
      }, [])
    : [];

  const listTestId = 'data-grid';

  return (
    <AutoSizer>
      {({ height, width }) => (
        <div data-testid="data-grid-component">
          <List
            width={width}
            height={height}
            rowCount={rows.length}
            rowHeight={50}
            rowRenderer={rowRenderer}
          />
        </div>
      )}
    </AutoSizer>
  );
};

export default TodoTxtDataGrid;
