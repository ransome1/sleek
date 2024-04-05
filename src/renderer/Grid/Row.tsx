import React, { memo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import CircleChecked from '@mui/icons-material/CheckCircle';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { withTranslation, WithTranslation } from 'react-i18next';
import RendererComponent from './Renderer';
import './Row.scss';
import { i18n } from '../Settings/LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  todoObject: TodoObject;
  filters: Filters | null;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  settings: Settings,
  handleButtonClick: Function;
  t: typeof i18n.t;
}

const Row: React.FC<Props> = memo(({
  todoObject,
  filters,
  setDialogOpen,
  setTodoObject,
  setContextMenu,
  setPromptItem,
  settings,
  handleButtonClick,
  t,
}) => {

  const handleConfirmDelete = () => {
    if(todoObject) ipcRenderer.send('removeLineFromFile', todoObject?.lineNumber);
  };

  const handleSaveToClipboard = () => {
    if(todoObject) ipcRenderer.send('saveToClipboard', todoObject?.string);
  };

  const handleContextMenu = (event: React.MouseEvent, todoString: string) => {
    setContextMenu({
      event: event,
      items: [
        {
          id: 'copy',
          label: t('copy'),
          function: handleSaveToClipboard,
        },
        {
          id: 'delete',
          label: t('delete'),
          promptItem: {
            id: 'delete',
            headline: t('prompt.delete.headline'),
            text: `${t('prompt.delete.text')}: <code>${todoString}</code>`,
            button1: t('delete'),
            onButton1: handleConfirmDelete,
          }
        }
      ]
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ipcRenderer.send('writeTodoToFile', todoObject.lineNumber, todoObject.string, event.target.checked, false);
  };

  const handleRowClick = (event: any) => {
    const clickedElement = event.target as HTMLElement;

    if((event.type === 'keydown' && event.key === 'Enter') || event.type === 'click') {      
      const preventDialog = () => {
        let match = false;
        
        if(clickedElement.classList.contains('MuiChip-label')) match = true;
        if(clickedElement.getAttribute('data-testid') === 'datagrid-picker-date-t') match = true;
        if(clickedElement.getAttribute('data-testid') === 'datagrid-picker-date-due') match = true;
        if(clickedElement.tagName.toLowerCase() === 'path') match = true;
        if(clickedElement.tagName.toLowerCase() === 'a') match = true;
        if(clickedElement.tagName.toLowerCase() === 'input') match = true;
        if(clickedElement.tagName.toLowerCase() === 'button') match = true;
        if(clickedElement.tagName.toLowerCase() === 'svg') match = true;
        return match;
      };      
      if(!preventDialog() && todoObject) {
        event.preventDefault();
        setTodoObject(todoObject);
        setDialogOpen(true);
      }
    } else if((event.metaKey || event.ctrlKey) && (event.key === 'Delete' || event.key === 'Backspace')) {
      setPromptItem({
        id: 'delete',
        headline: t('prompt.delete.headline'),
        text: `${t('prompt.delete.text')}: <code>${todoObject.string}</code>`,
        button1: t('delete'),
        onButton1: handleConfirmDelete,
      });
    } else if((event.metaKey || event.ctrlKey) && (event.key === 'c')) {
      handleSaveToClipboard();
    }
  };

  return (
    <>
      <ListItem
        tabIndex={0}
        key={todoObject.lineNumber}
        className="row"
        data-complete={todoObject.complete}
        data-hidden={todoObject.hidden}
        onClick={(event) => handleRowClick(event)}
        onKeyDown={(event) => handleRowClick(event)}
        onContextMenu={(event) => handleContextMenu(event, todoObject.string)}
        data-todotxt-attribute="priority"
        data-todotxt-value={todoObject.priority}
        data-testid={`datagrid-row`}
      >
        <Checkbox
          icon={<CircleUnchecked />}
          checkedIcon={<CircleChecked />}
          tabIndex={0}
          checked={todoObject.complete}
          onChange={handleCheckboxChange}
          inputProps={{'data-testid': 'datagrid-checkbox'}}
        />

        {todoObject.hidden && <VisibilityOffIcon />}

        <RendererComponent 
          todoObject={todoObject}
          filters={filters}
          settings={settings}
          handleButtonClick={handleButtonClick}
        />

      </ListItem>
    </>
  );
});

export default withTranslation()(Row);
