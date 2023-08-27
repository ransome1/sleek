import React, { useState } from 'react';
import { Checkbox, ListItem, Button, Divider, Chip } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPizzaSlice, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import theme from './Theme';
import { handleFilterSelect } from './Shared';
import ContextMenu from './ContextMenu';
import DatePickerInline from './DatePickerInline';
import './DataGridRow.scss';

const DataGridRow = React.memo(({ todoObject, attributes, filters, setDialogOpen, setTextFieldValue, setTodoObject }) => {
  const [contextMenuPosition, setContextMenuPosition] = useState(null);

  const handleCheckboxChange = (event) => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.send('writeTodoToFile', todoObject.id, todoObject.string, event.target.checked, false);
  };

  const handleRowClick = (event) => {
    const clickedElement = event.target;
    if ((event.type === 'keydown' && event.key === 'Enter') || event.type === 'click') {
      if (clickedElement.classList.contains('MuiChip-label') || clickedElement.closest('.MuiChip-label')) {
        return;
      }

      if (clickedElement.tagName === 'SPAN' || clickedElement.tagName === 'LI') {
        setDialogOpen(true);
        setTodoObject(todoObject);
        setTextFieldValue(todoObject.string);
      }
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
  };

  const handleButtonClick = (key, value) => {
    handleFilterSelect(key, value, filters, false);
  };

  if (todoObject.group) {
    const value = todoObject.value;

    if (!value) {
      return <Divider />;
    }

    const valuesArray = value.split(',');

    return (
      <ListItem className="row group" data-todotxt-attribute={todoObject.group} data-todotxt-value={value}>
        {valuesArray.map((val, index) => (
          <Button key={index} className="attribute" onClick={() => handleButtonClick(val.trim(), todoObject.group)}>
            {val.trim()}
          </Button>
        ))}
      </ListItem>
    );
  }

  const replacements = {
    'due': () => (
        <DatePickerInline
          type="due"
          todoObject={todoObject}
        />
    ),
    't': () => (
        <DatePickerInline
          type="t"
          todoObject={todoObject}
        />
    ),    
    'contexts': (match, type) => (
        <Button onClick={() => handleButtonClick(type, match)}>{match}</Button>
    ),
    'projects': (match, type) => (
        <Button onClick={() => handleButtonClick(type, match)}>{match}</Button>
    ),
    'rec': (match, type) => (
        <Button onClick={() => handleButtonClick(type, match)}>
          <Chip label='Recurrence' />
          {match}
        </Button>
    ),
    'pm': (match, type) => (
        <Button onClick={() => handleButtonClick(type, match)}>
          <FontAwesomeIcon icon={faPizzaSlice} />
          {match}
        </Button>
    ),   
    'hidden': () => (null),
  };

  const matches = () => {
    const expressions = [
      { pattern: new RegExp(`t:${todoObject.tString?.replace(/\s/g, '\\s')}`, 'g'), type: 't', key: 't:' },
      { pattern: new RegExp(`due:${todoObject.dueString?.replace(/\s/g, '\\s')}`, 'g'), type: 'due', key: 'due:' },
      { pattern: /(@\S+)/, type: 'contexts', key: '@' },
      { pattern: /\+\S+/, type: 'projects', key: '+' },
      { pattern: /^rec:(\+?\d*[dbwmy])$/, type: 'rec', key: 'rec:' },
      { pattern: /\bh:1\b/, type: 'hidden', key: 'h:1' },
      { pattern: /pm:\d+\b/, type: 'pm', key: 'pm:' },
    ];

    let body = todoObject.body;
    let substrings = [];
    let index = 0;

    while (body.length > 0) {
      let matched = false;

      for (const expression of expressions) {
        const regex = new RegExp(`^(${expression.pattern.source})`);
        const match = body.match(regex);

        if (match) {
          matched = true;

          const value = match[0].substr(expression.key.length);

          substrings.push({ type: expression.type, value: value, key: expression.key, index: index });
          body = body.substring(match[0].length);
          break;
        }
      }

      if (!matched) {
        const nextSpaceIndex = body.indexOf(' ');
        const endOfWordIndex = nextSpaceIndex !== -1 ? nextSpaceIndex : body.length;

        substrings.push({ type: null, value: body.substring(0, endOfWordIndex), index: index });
        body = body.substring(endOfWordIndex + 1);
      }

      index++;
    }

    return substrings;
  };

  const elements = matches().map((element, index) => {
    if (!element.value) return null;

    const selected = (filters[element.type] || []).some((filter) => filter.value === element.value);

    const content = replacements[element.type]
      ? replacements[element.type](element.value, element.type)
      : <span>{element.value}</span>;

    return (
      <React.Fragment key={index}>
        {element.type !== null ? (
          <div
            className={selected ? 'selected' : ''}
            data-todotxt-attribute={element.type}
          >
            {content}
          </div>
        ) : (
          content
        )}
      </React.Fragment>
    );
  });

  return (
    <ThemeProvider theme={theme}>
      <ContextMenu index={todoObject.id} anchorPosition={contextMenuPosition} setContextMenuPosition={setContextMenuPosition} />

      <ListItem
        tabIndex={0}
        key={todoObject.id}
        className="row"
        data-complete={todoObject.complete}
        data-hidden={todoObject.hidden}
        onClick={handleRowClick}
        onKeyDown={handleRowClick}
        onContextMenu={handleContextMenu}
        data-todotxt-attribute="priority"
        data-todotxt-value={todoObject.priority}
      >
        <Checkbox tabIndex={0} checked={todoObject.complete} onChange={handleCheckboxChange} />

        {todoObject.hidden && (
          <FontAwesomeIcon icon={faEyeSlash} />
        )}

        {elements}

      </ListItem>
    </ThemeProvider>
  );
});

export default DataGridRow;
