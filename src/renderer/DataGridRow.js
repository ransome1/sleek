import React, { useState } from 'react';
import Sugar from 'sugar';
import dayjs from 'dayjs';
import { Checkbox, ListItem, Button, Divider } from '@mui/material';
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

  const processDateWithSugar = (substrings, dateIndex) => {
    let currentIndex = dateIndex;
    let combinedValue = substrings[currentIndex].value;

    while (currentIndex < substrings.length) {
      const sugarDate = Sugar.Date.create(combinedValue);

      if (Sugar.Date.isValid(sugarDate)) {
        substrings[dateIndex].value = dayjs(sugarDate).format('YYYY-MM-DD');
        for (let i = dateIndex + 1; i <= currentIndex; i++) {
          substrings[i] = { type: null, value: null, index: i };
        }        
        break;
      } else {
        currentIndex++;

        if (currentIndex < substrings.length) {
          combinedValue += substrings[currentIndex].value + ' ';
        } else {
          break;
        }
      }
    }
    return substrings;
  };

  const extractedMatches = () => {
    const expressions = [
      { pattern: /(@\S+)/, type: 'contexts', key: '@' },
      { pattern: /\+\S+/, type: 'projects', key: '+' },
      { pattern: /\bdue:\S+\b/, type: 'due', key: 'due:' },
      { pattern: /\bt:\S+\b/, type: 't', key: 't:' },
      { pattern: /^rec:(\+?\d*[dbwmy])$/, type: 'rec', key: 'rec:' },
      { pattern: /pm:\d+\b/, type: 'pm', key: 'pm:' },
    ];

    let body = todoObject.body;
    let substrings = [];
    let index = 0;
    let dueIndex;
    let tIndex;

    while (body.length > 0) {
      let matched = false;


      for (const expression of expressions) {
        const regex = new RegExp(`^(${expression.pattern.source})`);
        const match = body.match(regex);

        if (match) {
          matched = true;
          if(expression.type === "due") dueIndex = index;
          if(expression.type === "t") tIndex = index;

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

    if (dueIndex > 0) {
      substrings = processDateWithSugar(substrings, dueIndex);
    }
    if(tIndex > 0) {
      substrings = processDateWithSugar(substrings, tIndex);
    }

    return substrings;
  };


  const rowElements = extractedMatches().map((element, index) => {

    if(!element.value) return;

    if (element.type === 'contexts' || element.type === 'projects') {
      return (
        <div key={index} data-todotxt-attribute={element.type}>
          <Button onClick={() => handleButtonClick(element.type, element.value)}>{element.value}</Button>
        </div>
      );
    } else if (element.type === 'due' || element.type === 't') {
      return (
        <div key={index} data-todotxt-attribute={element.type}>
          <DatePickerInline
            currentDate={element.value}
            type={element.type}
            todoObject={todoObject}
          />
        </div>
      );
    } else if (element.type === 'pm') {
      return (
        <div key={index} data-todotxt-attribute={element.type}>
          <Button onClick={() => handleButtonClick(element.type, element.value)}>
            <FontAwesomeIcon icon={faPizzaSlice} />
            {element.value}
          </Button>
        </div>
      );
    } else {
      return (
        <span key={index}>{element.value} </span>
      );
    }
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

        {rowElements}

      </ListItem>
    </ThemeProvider>
  );
});

export default DataGridRow;