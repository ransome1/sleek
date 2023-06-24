import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './DataGrid.css';
import { TodoTxtDataGridRow } from './DataGridRow.js';

const TodoTxtDataGrid = ({ todoTxtObjects }) => {
  if (!todoTxtObjects) {
    return null; // or display a loading state, error message, etc.
  }

  const columns = [
    {
      field: 'body',
      headerName: 'Body',
      flex: 1,
      renderCell: (params) => <TodoTxtDataGridRow rowData={params.row} />
    },
    // Add additional columns as needed
  ];

  const rows = Object.entries(todoTxtObjects).reduce((acc, [groupKey, groupData]) => {
    const headerRow = { id: groupKey, body: groupKey, group: true };
    const groupRows = groupData.map((item) => ({ ...item, id: item.id.toString() }));
    return [...acc, headerRow, ...groupRows];
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
