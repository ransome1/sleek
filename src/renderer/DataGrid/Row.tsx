import React, { useEffect } from 'react';
import { Checkbox, ListItem, Box } from '@mui/material';
import CircleChecked from '@mui/icons-material/CheckCircle';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { withTranslation } from 'react-i18next';
import { i18n } from './LanguageSelector';
import Group from './Group';
import Elements from './Elements';
import { handleFilterSelect } from '../Shared';
import './Row.scss';

const ipcRenderer = window.api.ipcRenderer;

interface Row {
  row: any;
  filters: any;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>;
  setTodoObject: React.Dispatch<React.SetStateAction<any>>;
  setContextMenuPosition: React.Dispatch<React.SetStateAction<{ top: number; left: number } | null>>;
  setContextMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  t: any;
}

const Row: React.FC<DataGridRowProps> = ({
  row,
  filters,
  setDialogOpen,
  setTextFieldValue,
  setTodoObject,
  setContextMenuPosition,
  setContextMenuItems,
  t,
}) => {
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
    setContextMenuItems([
      {
        id: 'copy',
        todoObject: row,
        label: t(`copy`),
      },
      {
        id: 'delete',
        todoObject: row,
        headline: t(`prompt.delete.headline`),
        text: t(`prompt.delete.text`),
        label: t(`delete`),
      },
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

  const handleRowClick = (event: React.MouseEvent | React.KeyboardEvent) => {
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
        if(row) {
          setTodoObject(row);
          setDialogOpen(true);
        }
        //setTextFieldValue(row.string);
      }
    }
  };

  const handleButtonClick = (key: string, value: string) => {
    handleFilterSelect(key, value, filters, false);
  };

  if (row.group) {
    return (
      <Group
        todoObject={row}
        filters={filters}
        onClick={handleButtonClick}
      />
    );
  }

  return (
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
  );
};

export default withTranslation()(Row);