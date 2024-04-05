import React, { KeyboardEvent, memo, useState } from 'react';
import List from '@mui/material/List';
import Row from './Row';
import Group from './Group';
import { handleFilterSelect } from '../Shared';
import './Grid.scss';

const { ipcRenderer } = window.api;

interface GridComponentProps {
  todoData: TodoData | null;
  filters: Filters | null;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: Settings;
  headers: Headers;
  searchString: string;
}

const GridComponent: React.FC<GridComponentProps> = memo(({
  todoData,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
  headers,
  searchString,
 }) => {

  let renderedRows: number[] = [];
  const list = document.getElementById('grid');
  const [loadMoreRows, setLoadMoreRows] = useState(false);
  const [maxRows, setMaxRows] = useState(Math.floor(window.innerHeight / 35) * 2);

  const handleButtonClick = (key: string, name: string, values: string[]) => {
    handleFilterSelect(key, name, values, filters, false);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if(event.key === 'ArrowDown') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex = Array.from(listItems).indexOf(document.activeElement);
      const nextIndex = currentIndex + 1;
      const nextElement = listItems[nextIndex];
      if(nextElement) {
        nextElement.focus();
      }
    } else if(event.key === 'ArrowUp') {
      const listItems = document.querySelectorAll('li:not(.group)');
      const currentIndex: number = Array.from(listItems).indexOf(document.activeElement);
      const prevIndex: number = currentIndex - 1;
      const prevElement: Element = listItems[prevIndex];
      if(prevElement) {
        prevElement.focus();
      }
    } else if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if(!event.target.closest('li')) return;
      const rowItems = event.target.closest('li').querySelectorAll(
        'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      const currentIndex = Array.from(rowItems).indexOf(document.activeElement);
      const nextIndex = event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
      const nextElement = rowItems[nextIndex];
      if(nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleScroll = () => {
    if(list) {
      const a: number = list.scrollTop;
      const b: number = list.scrollHeight - list.clientHeight;
      const c: number = a / b;

      if(c >= 0.85 && renderedRows.length < headers.availableObjects) {
        setLoadMoreRows(true);
      }

      if(loadMoreRows) {
        setLoadMoreRows(false);
        setMaxRows((maxRows) => maxRows + 30);
        ipcRenderer.send('requestData', searchString);
      }
    }
  };

  return (
    <List id="grid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
      {todoData?.map(group => {
        if (!group.visible) {
          return null;
        }
        return (
          <React.Fragment key={group.title}>
            <Group
              title={group.title}
              todotxtAttribute={settings.sorting[0].value}
              filters={filters}
              onClick={handleButtonClick}
            />
            {(() => {
              const rows = [];
              for (let i = 0; i < group.todoObjects.length; i++) {
                const todoObject = group.todoObjects[i];

                if(renderedRows.length >= maxRows) {
                  break;
                } else if(renderedRows.includes(todoObject.lineNumber)) {
                  continue;
                }

                renderedRows.push(todoObject.lineNumber);

                rows.push(
                  <Row
                    key={todoObject.lineNumber}
                    todoObject={todoObject}
                    filters={filters}
                    setTodoObject={setTodoObject}
                    setDialogOpen={setDialogOpen}
                    setContextMenu={setContextMenu}
                    setPromptItem={setPromptItem}
                    settings={settings}
                    handleButtonClick={handleButtonClick}
                  />
                );
              }
              return rows;

            })()}
          </React.Fragment>
        );
      })}
    </List>
  );
});

export default GridComponent;
