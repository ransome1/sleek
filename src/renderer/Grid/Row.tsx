import React, { memo, SyntheticEvent } from 'react';
import Checkbox from '@mui/material/Checkbox';
import ListItem from '@mui/material/ListItem';
import CircleChecked from '@mui/icons-material/CheckCircle';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { withTranslation, WithTranslation } from 'react-i18next';
import Group from './Group';
import Elements from './Elements';
import { handleFilterSelect } from '../Shared';
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
  t,
}) => {

  const handleConfirmDelete = () => {
    if(todoObject) ipcRenderer.send('removeLineFromFile', todoObject?.id);
  };

  const handleSaveToClipboard = () => {
    if(todoObject) ipcRenderer.send('saveToClipboard', todoObject?.string);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
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
            text: t('prompt.delete.text'),
            button1: t('delete'),
            onButton1: handleConfirmDelete,
          }
        }
      ]
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ipcRenderer.send('writeTodoToFile', todoObject.id, todoObject.string, event.target.checked, false);
  };

  const handleRowClick = (event: any) => {
    const clickedElement = event.target as HTMLElement;
    if((event.type === 'keydown' && event.key === 'Enter') || event.type === 'click') {
      if(clickedElement.classList.contains('MuiChip-label') || clickedElement.closest('.MuiChip-label')) {
        return;
      } else if(todoObject && (clickedElement.tagName === 'SPAN' || clickedElement.tagName === 'LI')) {
        event.preventDefault();
        setTodoObject(todoObject);
        setDialogOpen(true);
      }
    } else if((event.metaKey || event.ctrlKey) && (event.key === 'Delete' || event.key === 'Backspace')) {
      setPromptItem({
        id: 'delete',
        headline: t('prompt.delete.headline'),
        text: t('prompt.delete.text'),
        button1: t('delete'),
        onButton1: handleConfirmDelete,
      });
    } else if((event.metaKey || event.ctrlKey) && (event.key === 'c')) {
      handleSaveToClipboard();
    }
  };

  const handleButtonClick = (key: string, value: string) => {
    handleFilterSelect(key, value, filters, false);
  };

  if(todoObject.group) {
    return (
      <Group
        value={(todoObject.value) ? todoObject.value : ''}
        group={todoObject.group}
        filters={filters}
        onClick={handleButtonClick}
      />
    );
  }

  return (
    <>
      <ListItem
        tabIndex={0}
        key={todoObject.id}
        className="row"
        data-complete={todoObject.complete}
        data-hidden={todoObject.hidden}
        onClick={(event) => handleRowClick(event)}
        onKeyDown={(event) => handleRowClick(event)}
        onContextMenu={handleContextMenu}
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

        <Elements
          todoObject={todoObject}
          filters={filters}
          handleButtonClick={handleButtonClick}
          settings={settings}
        />
      </ListItem>
    </>
  );
});

export default withTranslation()(Row);
