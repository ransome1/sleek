import React, { useEffect, useState } from 'react';
import icon from '../../assets/icon.svg';
import TodoTxtDataGrid from './DataGrid.js';
import { Item } from 'jsTodoTxt';

window.electron.ipcRenderer.once('displayError', (arg) => {
  console.error(arg);
});

const App = () => {
  const [todoTxtObjects, setTodoTxtObjects] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      window.electron.ipcRenderer.once('receiveTodoTxtObjects', (arg) => {
        setTodoTxtObjects(arg as null);
      });
      window.electron.ipcRenderer.send('requestTodoTxtObjects');
    };
    fetchData();
  }, []);

  return (
    <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />
  );
};

export default App;
