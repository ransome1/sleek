import React, { useState } from 'react';
import { Avatar, Chip, Checkbox, ListItem, Divider } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPizzaSlice } from '@fortawesome/free-solid-svg-icons';
import theme from './Theme';
import TodoDialog from './TodoDialog';
import './DataGridRow.scss';

const DataGridRow = ({ todoObject }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleCheckboxChange = (event) => {
    window.electron.ipcRenderer.send('changeCompleteState', todoObject.id, event.target.checked);
  };

  if (todoObject.group) {
    if (!todoObject.key) return <Divider />;
    return <ListItem key={todoObject.id} className="row group"><Chip data-body={todoObject.key} label={todoObject.key} /></ListItem>;
  }

  const words = todoObject.body.split(' ');
  const isExpression = (word, pattern, shortcut) => pattern.test(word);

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

  const handleDivClick = (event) => {
    
    //event.stopPropagation();

    if(event.target.tagName === 'LI') openAddTodoDialog();
    // if (!event.target.matches('input[type="checkbox"]') && !event.target.matches('.MuiChip-label')) {
    //   openAddTodoDialog();
    // }
  };

  const handleButtonClick = (word, value) => {
    // console.log(value);
    // console.log(word);
  };

  return (
    <ThemeProvider theme={theme}>
      {dialogOpen && <TodoDialog todoTxtObject={todoObject} setDialogOpen={setDialogOpen} />}
      <ListItem key={todoObject.id} className="row" data-complete={todoObject.complete} data-priority={todoObject.priority} onClick={handleDivClick}>
        <Checkbox checked={todoObject.complete} onChange={handleCheckboxChange} />
        {words.map((word, index) => {
          const expression = expressions.find((expr) => isExpression(word, expr.pattern));

          if (expression) {
            word = word.substr(expression.shortcut.length);
            if (expression.value === 'projects' || expression.value === 'contexts') {
              return (
                <Chip
                  variant="contained"
                  size="small"
                  onClick={() => handleButtonClick(word, expression.value)}
                  data-filter-type="filter"
                  data-todotxt-attribute={expression.value}
                  label={word}
                  avatar={<Avatar>{expression.shortcut}</Avatar>}
                  key={index}
                />
              );
            } else if (expression.value === 'due:' || expression.value === 't:') {
              return (
                <Chip
                  avatar={<FontAwesomeIcon data-testid='fa-icon-clock' icon={faClock} />}
                  onClick={() => handleButtonClick(word, expression.value)}
                  data-todotxt-attribute={expression.value}
                  label={word}
                  variant="contained"
                  key={index}
                />
              );
            } else if (expression.value === 'h:1') {
              return (
                <Chip
                  size="small"
                  avatar={<FontAwesomeIcon data-testid='fa-icon-clock' icon={faClock} />}
                  onClick={() => handleButtonClick(word, expression.value)}
                  data-todotxt-attribute={expression.value}
                  variant="contained"
                  label="Hidden"
                  key={index}
                />
              );
            } else if (expression.value === 'pm:') {
              return (
                <Chip
                  size="small"
                  avatar={<FontAwesomeIcon data-testid='fa-icon-pizza-slice' icon={faPizzaSlice} />}
                  onClick={() => handleButtonClick(word, expression.value)}
                  data-todotxt-attribute={expression.value}
                  variant="contained"
                  label={word}
                  key={index}
                />
              );
            } else {
              return (
                <Chip
                  size="small"
                  avatar={<Avatar>{expression.shortcut}</Avatar>}
                  data-todotxt-attribute={expression.value}
                  onClick={() => handleButtonClick(word, expression.value)}
                  label={word}
                  variant="contained"
                  key={index}
                />
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
