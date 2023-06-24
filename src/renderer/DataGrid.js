import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './DataGrid.css';
import { DataGridRow } from './DataGridRow.js';

const TodoTxtDataGrid = ({ todoTxtObjects }) => {
  if (!todoTxtObjects) {
    return null; // or display a loading state, error message, etc.
  }

  const columns = [
    {
      field: 'todo',
      flex: 1,
      renderCell: (params) => <DataGridRow rowData={params.row} />
    }
  ];

  const rows = Object.entries(todoTxtObjects).reduce((acc, [key, data]) => {
    const header = { id: key, body: key, group: true };
    const todos = data.map((todo) => ({ ...todo, id: todo.id.toString() }));
    return [...acc, header, ...todos];
  }, []);

  return (
    <div style={{ display: 'flex', flex: '1 1 auto', height: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        hideHeader={true}
        hideFooter={true}
      />
    </div>
  );
};

export default TodoTxtDataGrid;
