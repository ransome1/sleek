import React, { useState } from 'react';
import { Avatar, Chip, Checkbox, ListItem, Divider, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPizzaSlice, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import theme from './Theme';
import TodoDialog from './TodoDialog';
import './DataGridRow.scss';

const ipcRenderer = window.electron.ipcRenderer;

const expressions = [
  { pattern: /^@\S+$/, value: 'contexts', shortcut: '@' },
  { pattern: /^\+\S+$/, value: 'projects', shortcut: '+' },
  { pattern: /\bdue:\d{4}-\d{2}-\d{2}\b/, value: 'due:', shortcut: 'due:' },
  { pattern: /\bt:\d{4}-\d{2}-\d{2}\b/, value: 't:', shortcut: 't:' },
  { pattern: /^rec:\d*[dwmy]$/, value: 'rec:', shortcut: 'rec:' },
  { pattern: /\bh:1\b/, value: 'h:1', shortcut: 'h:1' },
  { pattern: /^#\S+$/, value: '#', shortcut: '#' },
  { pattern: /pm:\d+\b/, value: 'pm:', shortcut: 'pm:' }
];

const DataGridRow = ({ todoObject, attributes }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleCheckboxChange = (event) => {
    ipcRenderer.send('writeTodoToFile', todoObject.id, undefined, event.target.checked);
  };

  if (todoObject.group) {
    if (!todoObject.key) return <Divider />;
    return <ListItem key={todoObject.id} className="row group"><Chip data-body={todoObject.key} label={todoObject.key} /></ListItem>;
  }

  const words = todoObject.body.split(' ');
  const isExpression = (word, pattern, shortcut) => pattern.test(word);

  const handleRowClick = (event) => {
    if(event.target.tagName === 'LI') openAddTodoDialog();
  };

  const handleButtonClick = (word, value) => {
    // console.log(value);
    // console.log(word);
  };

  return (
    <ThemeProvider theme={theme}>
      {dialogOpen && <TodoDialog todoObject={todoObject} attributes={attributes} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />}
      <ListItem key={todoObject.id} className="row" data-complete={todoObject.complete} data-priority={todoObject.priority} data-hidden={todoObject.hidden} onClick={handleRowClick}>
        <Checkbox checked={todoObject.complete} onChange={handleCheckboxChange} />

        {todoObject.hidden && todoObject.hidden === '1' && (
          <FontAwesomeIcon data-testid='fa-icon-eye-slash' icon={faEyeSlash} />
        )}

        {words.map((word, index) => {
          const expression = expressions.find((expr) => isExpression(word, expr.pattern));
          if (expression) {
            word = word.substr(expression.shortcut.length);
            if (expression.value === 'projects' || expression.value === 'contexts') {
              return (
                <div key={index} data-todotxt-attribute={expression.value}>
                  <Button onClick={() => handleButtonClick(word, expression.value)}>{word}</Button>
                </div>
              );
            } else if (expression.value === 'due:' || expression.value === 't:') {
              return (
                <div key={index} data-todotxt-attribute={expression.value}>
                  <Button onClick={() => handleButtonClick(word, expression.value)}>
                    <FontAwesomeIcon data-testid='fa-icon-clock' icon={faClock} />{word}
                  </Button>
                </div>
              );
            } else if (expression.value === 'h:1') {
              return;
            } else if (expression.value === 'pm:') {
              return (
                <div key={index} data-todotxt-attribute={expression.value}>
                  <Button onClick={() => handleButtonClick(word, expression.value)}>
                    <FontAwesomeIcon data-testid='fa-icon-pizza-slice' icon={faPizzaSlice} />
                    {word}
                  </Button>
                </div>
              );
            } else {
              return (
                <div key={index} data-todotxt-attribute={expression.value}>
                  <Button onClick={() => handleButtonClick(word, expression.value)}>{word}</Button>
                </div>
              );
            }
          }
          return <React.Fragment key={index}>{word}&nbsp;</React.Fragment>;
        })}
      </ListItem>
    </ThemeProvider>
  );
};

export default DataGridRow;
