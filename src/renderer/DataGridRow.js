import React from 'react';
import { Button, Checkbox } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme.js';

const DataGridRow = ({ rowData }) => {

  if(rowData.group) return ( <h1>{rowData.body}</h1> )

  const handleCheckboxChange = (event) => {
    window.electron.ipcRenderer.send('changeCompleteState', rowData.id, event.target.checked);
  };

  if(rowData.body === '') return null

  // Split the string into an array of words
  const words = rowData.body.split(' ');

  // Function to check if a word matches the pattern
  const isContext = (word) => /^@\S+$/.test(word);
  const isProject = (word) => /^\+\S+$/.test(word);
  const isDueDate = (word) => /\bdue:\d{4}-\d{2}-\d{2}\b/.test(word);
  const isThresholdDate = (word) => /\bt:\d{4}-\d{2}-\d{2}\b/.test(word);
  const isRecurrance = (word) => /\brec:[dwmy]\b/.test(word);

  // Render the row with replaced words as spans
  return (
    <ThemeProvider theme={theme}>
      <div id={rowData.id}>
        <Checkbox 
          checked={rowData.complete}
          onChange={handleCheckboxChange} 
        />
        {words.map((word, index) => {
          if (
            isContext(word) ||
            isProject(word) ||
            isDueDate(word) ||
            isThresholdDate(word) ||
            isRecurrance(word)
          ) {
            return (
              <Button variant="contained" size="small" key={index}>
                {word}{' '}
              </Button>
            );
          } else {
            return (
              <React.Fragment key={index}>
                {word}{' '}
              </React.Fragment>
            );
          }
        })}
      </div>
    </ThemeProvider>
  );
};

export { DataGridRow };
