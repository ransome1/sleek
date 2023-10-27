import React, { useState } from 'react';
import { Checkbox, ListItem } from '@mui/material';
import CircleChecked from '@mui/icons-material/CheckCircle';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { withTranslation, WithTranslation } from 'react-i18next';
import Group from './Group';
import Elements from './Elements';
import { PromptItem, TodoObject, Filters } from '../../main/util';
import { handleFilterSelect } from '../Shared';
import './Row.scss';
import { i18n } from '../LanguageSelector';

const { ipcRenderer } = window.api;

interface Props extends WithTranslation {
  row: TodoObject;
  filters: Filters;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  setTodoObject: React.Dispatch<React.SetStateAction<any>>;
  setContextMenuPosition: React.Dispatch<React.SetStateAction<{ top: number; left: number } | null>>;
  setContextMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  setPromptItem: PromptItem;
  t: typeof i18n.t;
}

const Row: React.FC<Props> = ({
  row,
  filters,
  setDialogOpen,
  setTextFieldValue,
  setTodoObject,
  setContextMenuPosition,
  setContextMenuItems,
  setPromptItem,
  t,
}) => {
  const itemDelete = {
    id: 'delete',
    todoObject: row,
    headline: t('prompt.delete.headline'),
    text: t('prompt.delete.text'),
    label: t('delete'),
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuItems([
      {
        id: 'copy',
        todoObject: row,
        label: t('copy'),
      },
      itemDelete,
    ]);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ipcRenderer.send(
      'writeTodoToFile',
      row.id,
      row.string,
      event.target.checked,
      false
    );
  };

  const handleRowClick = (event: React.KeyboardEvent | React.MouseEvent) => {
    const clickedElement = event.target as HTMLElement;
    if ((event.type === 'keydown' && event.key === 'Enter') || event.type === 'click') {
      if (
        clickedElement.classList.contains('MuiChip-label') ||
        clickedElement.closest('.MuiChip-label')
      ) {
        return;
      }

      if (
        clickedElement.tagName === 'SPAN' ||
        clickedElement.tagName === 'LI'
      ) {
        if (row) {
          setTodoObject(row);
          setDialogOpen(true);
        }
        setTextFieldValue(row.string);
      }
    } else if ((event.metaKey || event.ctrlKey) && (event.key === 'Delete' || event.key === 'Backspace')) {
      setPromptItem(itemDelete);
    }
  };

  const handleButtonClick = (key: string, value: string) => {
    handleFilterSelect(key, value, filters, false);
  };

  if (row.group) {
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
        />
      </ListItem>
    </>
  );
};

export default withTranslation()(Row);