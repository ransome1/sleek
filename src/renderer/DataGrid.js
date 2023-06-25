import React from 'react';
import { DataGridRow } from './DataGridRow.js';
import { List, AutoSizer } from 'react-virtualized';
import Box from '@mui/material/Box';

const TodoTxtDataGrid = ({ todoTxtObjects }) => {
  if (!todoTxtObjects) {
    return null; // or display a loading state, error message, etc.
  }

  const rowRenderer = ({ index, key, style }) => {
    const rowData = rows[index];
    if (rowData.group) {
      // Render group header
      return (
        <div key={key} style={style}>
          {rowData.body}
        </div>
      );
    } else {
      // Render todo row
      return (
        <div key={key} style={style}>
          <DataGridRow rowData={rowData} />
        </div>
      );
    }
  };

  const rows = Object.entries(todoTxtObjects).reduce((acc, [key, data]) => {
    const header = { id: key, body: key, group: true };
    const todos = data
      .filter(todo => todo.body.trim() !== '') // Filter out todos with empty body
      .map(todo => ({ ...todo, id: todo.id.toString() }));
    return [...acc, header, ...todos];
  }, []);

  return (
        
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div style={{ height: '100vh', width: '100vw' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={rows.length}
              rowHeight={50}
              rowRenderer={rowRenderer}
            />
          )}
        </AutoSizer>
      </div>
    </Box>
  );

s
};


export default TodoTxtDataGrid;
