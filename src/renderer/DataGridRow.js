import React, { useState } from 'react';
import { Button, Checkbox } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme';
import TodoDialog from './TodoDialog';

const DataGridRow = ({ rowData }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleCheckboxChange = (event) => {
    window.electron.ipcRenderer.send('changeCompleteState', rowData.id, event.target.checked);
  };

  if (rowData.group) {
    return <h1>{rowData.body}</h1>;
  }

  if (rowData.body === '') {
    return null;
  }

  const words = rowData.body.split(' ');

  const isContext = (word) => /^@\S+$/.test(word);
  const isProject = (word) => /^\+\S+$/.test(word);
  const isDueDate = (word) => /\bdue:\d{4}-\d{2}-\d{2}\b/.test(word);
  const isThresholdDate = (word) => /\bt:\d{4}-\d{2}-\d{2}\b/.test(word);
  const isRecurrance = (word) => /^rec:\d*[dwmy]$/.test(word);
  const isHidden = (word) => /\bh:1\b/.test(word);
  const isTag = (word) => /^#\S+$/.test(word);
  const isPomodoro = (word) => /^#\S+$/.test(word) || /pm:\d+\b/.test(word);

  const handleDivClick = (event) => {
    if (!event.target.matches('input[type="checkbox"]') && !event.target.matches('button[type="button"]')) {
      openAddTodoDialog();
    }
  };

  const handleButtonClick = (event) => {
    console.log(event)
  };

  return (
    <ThemeProvider theme={theme}>
      {dialogOpen && <TodoDialog todoTxtObject={rowData} setDialogOpen={setDialogOpen} />}
      <div id={rowData.id} onClick={handleDivClick}>
        <Checkbox checked={rowData.complete} onChange={handleCheckboxChange} />
        {words.map((word, index) => {
          if (
            isContext(word) ||
            isProject(word) ||
            isDueDate(word) ||
            isThresholdDate(word) ||
            isRecurrance(word) ||
            isHidden(word) ||
            isTag(word) ||
            isPomodoro(word)
          ) {
            return (
              <Button variant="contained" size="small" key={index} onClick={handleButtonClick}>
                {word}{' '}
              </Button>
            );
          } else {
            return <React.Fragment key={index}>{word} </React.Fragment>;
          }
        })}
      </div>
    </ThemeProvider>
  );
};

export { DataGridRow };
