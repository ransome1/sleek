import React, { useEffect, useState } from 'react';
import TodoTxtDataGrid from './DataGrid.js';

const App = () => {
  const [todoTxtObjects, setTodoTxtObjects] = useState(null);
  const [reloadGrid, setReloadGrid] = useState(false);
  const handleReloadGrid = () => {
    setReloadGrid(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const receivedData = await new Promise((resolve, reject) => {
          window.electron.ipcRenderer.once('receiveTodoTxtObjects', resolve);
          window.electron.ipcRenderer.send('requestTodoTxtObjects');
        });

        setTodoTxtObjects(receivedData);
        setReloadGrid(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [reloadGrid]);

  useEffect(() => {
    window.electron.ipcRenderer.on('reloadGrid', handleReloadGrid);

    return () => {
      window.electron.ipcRenderer.off('reloadGrid', handleReloadGrid);
    };
  }, []);

  return <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />;
};

export default App;
