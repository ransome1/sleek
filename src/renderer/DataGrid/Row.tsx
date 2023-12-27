import React, { memo } from 'react';
import { Checkbox, ListItem } from '@mui/material';
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
  row: TodoObject;
  filters: Filters;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTodoObject: React.Dispatch<React.SetStateAction<any>>;
  settings: Settings,
  t: typeof i18n.t;
}

const Row: React.FC<Props> = memo(({
  row,
  filters,
  setDialogOpen,
  setTodoObject,
  setContextMenuItems,
  settings,
  t,
}) => {

  const handleContextMenu = (event: React.MouseEvent) => {

    const confirmDelete = () => {
      if(row) ipcRenderer.send('removeLineFromFile', row?.id);
    };

    const saveToClipboard = () => {
      if(row) ipcRenderer.send('saveToClipboard', row?.string);
    };

    const contextMenuItems = [
      {
        id: 'copy',
        label: t('copy'),
        function: saveToClipboard,
      },
      {
        id: 'delete',
        label: t('delete'),
        promptItem: {
          id: 'delete',
          headline: t('prompt.delete.headline'),
          text: t('prompt.delete.text'),
          button1: t('delete'),
          onButton1: confirmDelete,
        }
      }
    ]

    setContextMenuItems({
      event: event,
      items: contextMenuItems
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ipcRenderer.send('writeTodoToFile', row.id, row.string, event.target.checked, false);
  };

  const handleRowClick = (event: React.KeyboardEvent | React.MouseEvent) => {
    const clickedElement = event.target as HTMLElement;
    if((event.type === 'keydown' && event.key === 'Enter') || event.type === 'click') {
      if(
        clickedElement.classList.contains('MuiChip-label') ||
        clickedElement.closest('.MuiChip-label')
      ) {
        return;
      }

      if(
        clickedElement.tagName === 'SPAN' ||
        clickedElement.tagName === 'LI'
      ) {
        if(row) {
          setTodoObject(row);
          setDialogOpen(true);
        }
      }
    } else if((event.metaKey || event.ctrlKey) && (event.key === 'Delete' || event.key === 'Backspace')) {
      setPromptItem(itemDelete);
    }
  };

  const handleButtonClick = (key: string, value: string) => {
    handleFilterSelect(key, value, filters, false);
  };

  if(row.group) {
    return (
      <Group
        value={row.value}
        group={row.group}
        filters={filters}
        onClick={handleButtonClick}
      />
    );
  }

  return (
    <>
      <ListItem
        tabIndex={0}
        key={row.id}
        className="row"
        data-complete={row.complete}
        data-hidden={row.hidden}
        onClick={handleRowClick}
        onKeyDown={handleRowClick}
        onContextMenu={handleContextMenu}
        data-todotxt-attribute="priority"
        data-todotxt-value={row.priority}
      >
        <Checkbox
          icon={<CircleUnchecked />}
          checkedIcon={<CircleChecked />}
          tabIndex={0}
          checked={row.complete}
          onChange={handleCheckboxChange}
        />

        {row.hidden && <VisibilityOffIcon />}

        <Elements
          todoObject={row}
          filters={filters}
          handleButtonClick={handleButtonClick}
          settings={settings}
        />
      </ListItem>
    </>
  );
});

export default withTranslation()(Row);
