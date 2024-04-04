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
}

const GridComponent: React.FC<GridComponentProps> = memo(({
  todoData,
  filters,
  setDialogOpen,
  setContextMenu,
  setTodoObject,
  setPromptItem,
  settings,
 }) => {

  let renderedRows = 0;
  const list = document.getElementById('grid');
  const [loadMoreRows, setLoadMoreRows] = useState(true);
  const [maxRows, setMaxRows] = useState(50);

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
    if(list && loadMoreRows) {      
      const scrollPos = list.scrollTop;
      const totalHeight = list.scrollHeight;
      const clientHeight = list.clientHeight;
      if(totalHeight - scrollPos <= clientHeight * 3) {
        
        setLoadMoreRows(false);
        setMaxRows((maxRows) => maxRows + 30);
        ipcRenderer.send('requestData');
        
      }
    }
  };

  return (
    <List id="grid" onScroll={handleScroll} onKeyUp={handleKeyUp}>
      {todoData?.map(group => {

        if ((group.row <= renderedRows && renderedRows >= maxRows) || !group.visible) {
          return null;
        }

        renderedRows++;

        return (
          <React.Fragment key={group.title}>
            <Group
              title={group.title}
              todotxtAttribute={settings.sorting[0].value}
              filters={filters}
              onClick={handleButtonClick}
            />
            {group.todoObjects.map(todoObject => {

              if (!settings.showHidden && todoObject.hidden || todoObject.row <= renderedRows && renderedRows >= maxRows) {
                return null;
              }

              renderedRows++;

              return (
                <Row
                  key={todoObject.row}
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
            })}
          </React.Fragment>
        );
      })}
    </List>
  );
});

export default GridComponent;
