import React, { useState } from 'react';
import { Avatar, Chip, Checkbox, ListItem, Divider, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPizzaSlice, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import theme from './Theme';
import TodoDialog from './TodoDialog';
import { handleFilterSelect } from './Shared';
import ContextMenu from './ContextMenu';
import './DataGridRow.scss';

const ipcRenderer = window.electron.ipcRenderer;

const expressions = [
  { pattern: /^@\S+$/, value: 'contexts', shortcut: '@' },
  { pattern: /^\+\S+$/, value: 'projects', shortcut: '+' },
  { pattern: /\bdue:\d{4}-\d{2}-\d{2}\b/, value: 'due', shortcut: 'due:' },
  { pattern: /\bt:\d{4}-\d{2}-\d{2}\b/, value: 't', shortcut: 't:' },
  { pattern: /^rec:\d*[dbwmy]$/, value: 'rec', shortcut: 'rec:' },
  { pattern: /\bh:1\b/, value: 'h:1', shortcut: 'h:1' },
  //{ pattern: /^tag:\S+$/, value: 'tags', shortcut: 'tag:' },
  { pattern: /pm:\d+\b/, value: 'pm', shortcut: 'pm:' }
];

const isExpression = (word, pattern) => pattern.test(word);

const DataGridRow = ({ todoObject, attributes, filters }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleCheckboxChange = (event) => {
    ipcRenderer.send('writeTodoToFile', todoObject.id, undefined, event.target.checked);
  };

  const handleRowClick = (event) => {
    if (event.target.tagName === 'SPAN' || event.target.tagName === 'LI') {
      openAddTodoDialog();
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX }, );
  };

  const handleButtonClick = (value, key) => {
    handleFilterSelect(key, value, filters, false);
  };

  if (todoObject.group) {
    if (!todoObject.key) return <Divider />;
    return <ListItem key={todoObject.id} className="row group"><Chip data-body={todoObject.key} label={todoObject.key} /></ListItem>;
  }

  const words = todoObject.body.split(' ');
  const isExpression = (word, pattern, shortcut) => pattern.test(word);

  return (
    <ThemeProvider theme={theme}>

      {dialogOpen && <TodoDialog todoObject={todoObject} attributes={attributes} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />}

      <ContextMenu index={todoObject.id} anchorPosition={contextMenuPosition} setContextMenuPosition={setContextMenuPosition} />
      
      <ListItem key={todoObject.id} className="row" data-complete={todoObject.complete} data-priority={todoObject.priority} data-hidden={todoObject.hidden} onClick={handleRowClick} onContextMenu={handleContextMenu}>
      
        <Checkbox checked={todoObject.complete} onChange={handleCheckboxChange} />

        {todoObject.hidden && todoObject.hidden === '1' && (
          <FontAwesomeIcon data-testid='fa-icon-eye-slash' icon={faEyeSlash} />
        )}

        {(() => {
          return words.map((word, index) => {
            const expression = expressions.find((expr) => isExpression(word, expr.pattern));
            if (expression) {
              word = word.substr(expression.shortcut.length);

              const selected = (filters[expression.value] || []).some((filter) => filter.value === word);

              if (expression.value === 'due' || expression.value === 't') {
                return (
                  <div key={index} data-todotxt-attribute={expression.value} className={selected ? 'selected' : ''}>
                    <Button onClick={() => handleButtonClick(word, expression.value)}>
                      <FontAwesomeIcon data-testid='fa-icon-clock' icon={faClock} />{word}
                    </Button>
                  </div>
                );
              } else if (expression.value === 'h:1') {
                return null;
              } else if (expression.value === 'pm') {
                return (
                  <div key={index} data-todotxt-attribute={expression.value} className={selected ? 'selected' : ''}>
                    <Button onClick={() => handleButtonClick(word, expression.value)}>
                      <FontAwesomeIcon data-testid='fa-icon-pizza-slice' icon={faPizzaSlice} />
                      {word}
                    </Button>
                  </div>
                );
              } else {
                return (
                  <div key={index} data-todotxt-attribute={expression.value} className={selected ? 'selected' : ''}>
                    <Button onClick={() => handleButtonClick(word, expression.value)}>{word}</Button>
                  </div>
                );
              }
            }
            return <span key={index}>{word} </span>;
          });
        })()}
      </ListItem>
    </ThemeProvider>
  );
};

export default DataGridRow;
