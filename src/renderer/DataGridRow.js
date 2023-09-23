import React, { useState } from 'react';
import { Checkbox, ListItem, Button, Divider, Chip, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPizzaSlice, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { handleFilterSelect } from './Shared';
import ContextMenu from './ContextMenu';
import DatePickerInline from './DatePickerInline';
import './DataGridRow.scss';

const DataGridRow = React.memo(({todoObject, attributes, filters, setDialogOpen, setTextFieldValue, setTodoObject,}) => {
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

    const handleButtonClick = (key, value) => {
      handleFilterSelect(key, value, filters, false);
    };    

    const replacements = {
      due: () => (
        <DatePickerInline
          type="due"
          todoObject={todoObject}
          date={todoObject.due}
          filters={filters}
        />
      ),
      t: () => (
        <DatePickerInline
          type="t"
          todoObject={todoObject}
          date={todoObject.t}
          filters={filters}
        />
      ),
      contexts: (value, type) => (
        <Button onClick={() => handleButtonClick(type, value)}>
          <Box>{value}</Box>
        </Button>
      ),
      projects: (value, type) => (
        <Button onClick={() => handleButtonClick(type, value)}>
          <Box>{value}</Box>
        </Button>
      ),
      rec: (value, type) => (
        <Button onClick={() => handleButtonClick(type, value)}>
          <Chip label="rec:" />
          <Box>{value}</Box>
        </Button>
      ),
      pm: (value, type) => (
        <Button onClick={() => handleButtonClick(type, value)}>
          <FontAwesomeIcon icon={faPizzaSlice} />
          <Box>{value}</Box>
        </Button>
      ),
      hidden: () => null,
    };

    const matches = () => {
      const expressions = [
        { pattern: new RegExp(`t:${todoObject.tString?.replace(/\s/g, '\\s')}`, 'g'), type: 't', key: 't:' },
        { pattern: new RegExp(`due:${todoObject.dueString?.replace(/\s/g, '\\s')}`, 'g'), type: 'due', key: 'due:' },
        { pattern: /(@\S+)/, type: 'contexts', key: '@' },
        { pattern: /\+\S+/, type: 'projects', key: '+' },
        { pattern: /\bh:1\b/, type: 'hidden', key: 'h:1' },
        { pattern: /pm:\d+\b/, type: 'pm', key: 'pm:' },
        { pattern: /rec:([^ ]+)/, type: 'rec', key: 'rec:' },
      ];

      let body = todoObject.body;
      let substrings = [];
      let index = 0;

      if (body) {
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
      }
      return substrings;
    };

    const elements = matches().map((element, index) => {
      const selected = (filters[element.type] || []).some((filter) => filter.value === element.value);

      const content = replacements[element.type]
        ? replacements[element.type](element.value, element.type)
        : element.value ? <span>{element.value}</span> : null;

      return (
        <React.Fragment key={index}>
          {element.type !== null ? (
            <Box
              className={selected ? 'selected' : ''}
              data-todotxt-attribute={element.type}
            >
              {content}
            </Box>
          ) : (
            content
          )}
        </React.Fragment>
      );
    });

    if (todoObject.group) {
      const value = todoObject.value;

      if (!value) {
        return <Divider />;
      }

      const valuesArray = value.split(',');

      return (
        <ListItem className="row group">
          {valuesArray.map((val, index) => {
            const selected = (filters[todoObject.group] || []).some((filter) => filter.value === val.trim());

            return (
              <Box
                key={index}
                className={selected ? 'selected' : ''}
                data-todotxt-attribute={todoObject.group}
                data-todotxt-value={value}
              >
                <Button className='attribute' onClick={() => handleButtonClick(todoObject.group, val.trim())}>
                  {val.trim()}
                </Button>
              </Box>
            );
          })}
        </ListItem>
      );
    }

    const handleContextMenuClick = (event) => {
      event.preventDefault();
      setContextMenuPosition({ top: event.clientY, left: event.clientX });
    };

    const handleCloseContextMenu = () => {
      setContextMenuPosition(null);
    };    

    const contextMenuItems = [
      {
        id: 'delete',
        action: () => {
          handleCloseContextMenu();
        },
        headline: 'Delete todo?',
        text: 'The todo will be permanently removed from the file',
        label: 'Delete',
      },
    ];

    return (
      <> 
        <ContextMenu
          index={todoObject.id}
          anchorPosition={contextMenuPosition}
          items={contextMenuItems}
          onClose={handleCloseContextMenu}
        />        

        <ListItem
          tabIndex={0}
          key={todoObject.id}
          className="row"
          data-complete={todoObject.complete}
          data-hidden={todoObject.hidden}
          onClick={handleRowClick}
          onKeyDown={handleRowClick}
          onContextMenu={handleContextMenuClick}
          data-todotxt-attribute="priority"
          data-todotxt-value={todoObject.priority}
        >
          <Checkbox tabIndex={0} checked={todoObject.complete} onChange={handleCheckboxChange} />

          {todoObject.hidden && (
            <FontAwesomeIcon icon={faEyeSlash} />
          )}

          {elements}

        </ListItem>
      </>
    );
  }
);

export default DataGridRow;
